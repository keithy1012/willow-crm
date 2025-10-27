import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import User from "../models/users/User.js";
import Conversation from "../models/messaging/Conversation.js";
import Message from "../models/messaging/Message.js";

class SocketServer {
  constructor() {
    this.wss = null;
    this.clients = new Map(); 
    this.userSockets = new Map();
  }

  initialize(server) {
    this.wss = new WebSocketServer({
      server,
      path: "/ws",
    });

    this.wss.on("connection", (ws, req) => {
      console.log("New WebSocket connection");

      ws.isAlive = true;
      ws.on("pong", () => {
        ws.isAlive = true;
      });

      ws.on("message", async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error("Error handling message:", error);
          this.sendError(ws, "Invalid message format");
        }
      });

      ws.on("close", () => {
        this.handleDisconnect(ws);
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
      });
    });

    this.startHeartbeat();
  }

  async handleMessage(ws, message) {
    switch (message.type) {
      case "auth":
        await this.handleAuth(ws, message.token);
        break;

      case "get-conversations":
        await this.handleGetConversations(ws);
        break;

      case "get-messages":
        await this.handleGetMessages(ws, message.data);
        break;

      case "send-message":
        await this.handleSendMessage(ws, message.data);
        break;

      case "typing":
        await this.handleTyping(ws, message.data);
        break;

      case "mark-as-read":
        await this.handleMarkAsRead(ws, message.data);
        break;

      case "create-conversation":
        await this.handleCreateConversation(ws, message.data);
        break;

      case "ping":
        ws.send(JSON.stringify({ type: "pong" }));
        break;

      default:
        console.warn("Unknown message type:", message.type);
    }
  }

  async handleAuth(ws, token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select(
        "firstName lastName email username profilePic role"
      );

      if (!user) {
        ws.close(1008, "User not found");
        return;
      }

      // Store user info on connection
      ws.userId = user._id.toString();
      ws.user = {
        id: user._id.toString(),
        name: `${user.firstName} ${user.lastName}`,
        username: user.username,
        avatar: user.profilePic,
        role: user.role,
      };

      // Add to clients map
      this.clients.set(ws.userId, ws);

      // Track multiple connections
      if (!this.userSockets.has(ws.userId)) {
        this.userSockets.set(ws.userId, new Set());
      }
      this.userSockets.get(ws.userId).add(ws);

      // Update user online status
      await User.findByIdAndUpdate(user._id, {
        isOnline: true,
        lastActive: new Date(),
      });

      // Send success message
      ws.send(
        JSON.stringify({
          type: "auth-success",
          user: ws.user,
        })
      );

      // Broadcast online status
      this.broadcastUserStatus(ws.userId, "online");

      // Send online users list
      this.sendOnlineUsers(ws);

      console.log(`User ${user.email} authenticated`);
    } catch (error) {
      console.error("Auth failed:", error);
      ws.send(
        JSON.stringify({
          type: "auth-error",
          error: "Authentication failed",
        })
      );
      ws.close(1008, "Invalid token");
    }
  }

  async handleGetConversations(ws) {
    if (!ws.userId) {
      this.sendError(ws, "Not authenticated");
      return;
    }

    try {
      const conversations = await Conversation.find({
        participants: ws.userId,
      })
        .populate("participants", "firstName lastName username profilePic role")
        .populate("lastMessage")
        .sort("-updatedAt");

      // Transform conversations for frontend
      const transformedConversations = conversations.map((conv) => ({
        id: conv._id.toString(),
        participants: conv.participants.map((p) => ({
          id: p._id.toString(),
          name: `${p.firstName} ${p.lastName}`,
          username: p.username,
          avatar: p.profilePic,
          role: p.role,
        })),
        lastMessage: conv.lastMessage
          ? {
              id: conv.lastMessage._id.toString(),
              content: conv.lastMessage.content,
              timestamp: conv.lastMessage.createdAt,
              sender: conv.lastMessage.sender,
            }
          : null,
        unreadCount: conv.unreadCount || 0,
        updatedAt: conv.updatedAt,
      }));

      ws.send(
        JSON.stringify({
          type: "conversations-list",
          conversations: transformedConversations,
        })
      );
    } catch (error) {
      console.error("Error fetching conversations:", error);
      this.sendError(ws, "Failed to fetch conversations");
    }
  }

  async handleGetMessages(ws, data) {
    if (!ws.userId) {
      this.sendError(ws, "Not authenticated");
      return;
    }

    const { conversationId } = data;

    try {
      // Verify user is participant
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: ws.userId,
      });

      if (!conversation) {
        this.sendError(ws, "Conversation not found");
        return;
      }

      // Get messages
      const messages = await Message.find({
        conversation: conversationId,
      })
        .populate("sender", "firstName lastName username profilePic")
        .sort("createdAt")
        .limit(50); // Last 50 messages

      // Transform messages
      const transformedMessages = messages.map((msg) => ({
        id: msg._id.toString(),
        conversationId: msg.conversation.toString(),
        sender: {
          id: msg.sender._id.toString(),
          name: `${msg.sender.firstName} ${msg.sender.lastName}`,
          username: msg.sender.username,
          avatar: msg.sender.profilePic,
        },
        content: msg.content,
        timestamp: msg.createdAt,
        read: msg.read,
        delivered: msg.delivered,
      }));

      ws.send(
        JSON.stringify({
          type: "messages-history",
          messages: transformedMessages,
        })
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
      this.sendError(ws, "Failed to fetch messages");
    }
  }

  async handleSendMessage(ws, data) {
    if (!ws.userId) {
      this.sendError(ws, "Not authenticated");
      return;
    }

    const { conversationId, recipientId, content, tempId } = data;

    try {
      // Verify conversation exists and user is participant
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: ws.userId,
      });

      if (!conversation) {
        this.sendError(ws, "Conversation not found");
        return;
      }

      // Create message
      const message = new Message({
        conversation: conversationId,
        sender: ws.userId,
        content: content,
        delivered: false,
        read: false,
      });

      await message.save();

      // Update conversation
      conversation.lastMessage = message._id;
      conversation.updatedAt = new Date();
      await conversation.save();

      // Populate sender info
      await message.populate(
        "sender",
        "firstName lastName username profilePic"
      );

      // Prepare message payload
      const messagePayload = {
        id: message._id.toString(),
        conversationId: conversationId,
        sender: {
          id: message.sender._id.toString(),
          name: `${message.sender.firstName} ${message.sender.lastName}`,
          username: message.sender.username,
          avatar: message.sender.profilePic,
        },
        content: content,
        timestamp: message.createdAt,
        read: false,
        delivered: false,
      };

      // Send confirmation to sender
      ws.send(
        JSON.stringify({
          type: "message-sent",
          message: { ...messagePayload, tempId },
        })
      );

      // Send to recipient if online
      const recipientWs = this.clients.get(recipientId);
      if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
        recipientWs.send(
          JSON.stringify({
            type: "new-message",
            message: messagePayload,
          })
        );

        // Mark as delivered
        message.delivered = true;
        await message.save();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      this.sendError(ws, "Failed to send message");
    }
  }

  async handleTyping(ws, data) {
    if (!ws.userId) return;

    const { conversationId, recipientId, isTyping } = data;

    const recipientWs = this.clients.get(recipientId);
    if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
      recipientWs.send(
        JSON.stringify({
          type: "typing-status",
          conversationId,
          user: ws.user,
          isTyping,
        })
      );
    }
  }

  async handleMarkAsRead(ws, data) {
    if (!ws.userId) return;

    const { conversationId, messageIds } = data;

    try {
      // Update messages as read
      await Message.updateMany({ _id: { $in: messageIds } }, { read: true });

      // Get message senders
      const messages = await Message.find({
        _id: { $in: messageIds },
      }).select("sender");

      // Notify senders
      const senderIds = [...new Set(messages.map((m) => m.sender.toString()))];
      senderIds.forEach((senderId) => {
        if (senderId !== ws.userId) {
          const senderWs = this.clients.get(senderId);
          if (senderWs && senderWs.readyState === WebSocket.OPEN) {
            senderWs.send(
              JSON.stringify({
                type: "messages-read",
                conversationId,
                messageIds,
                readBy: ws.userId,
              })
            );
          }
        }
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }

  async handleCreateConversation(ws, data) {
    if (!ws.userId) {
      this.sendError(ws, "Not authenticated");
      return;
    }

    const { recipientId } = data;

    try {
      // Check if conversation already exists
      let conversation = await Conversation.findOne({
        participants: { $all: [ws.userId, recipientId] },
      }).populate(
        "participants",
        "firstName lastName username profilePic role"
      );

      if (!conversation) {
        // Create new conversation
        conversation = new Conversation({
          participants: [ws.userId, recipientId],
          createdBy: ws.userId,
        });
        await conversation.save();

        // Populate participants
        await conversation.populate(
          "participants",
          "firstName lastName username profilePic role"
        );
      }

      // Transform for frontend
      const transformedConversation = {
        id: conversation._id.toString(),
        participants: conversation.participants.map((p) => ({
          id: p._id.toString(),
          name: `${p.firstName} ${p.lastName}`,
          username: p.username,
          avatar: p.profilePic,
          role: p.role,
        })),
        lastMessage: null,
        unreadCount: 0,
        updatedAt: conversation.updatedAt,
      };

      ws.send(
        JSON.stringify({
          type: "conversation-created",
          conversation: transformedConversation,
        })
      );
    } catch (error) {
      console.error("Error creating conversation:", error);
      this.sendError(ws, "Failed to create conversation");
    }
  }

  handleDisconnect(ws) {
    if (!ws.userId) return;

    console.log(`User ${ws.userId} disconnected`);

    this.clients.delete(ws.userId);

    const userSockets = this.userSockets.get(ws.userId);
    if (userSockets) {
      userSockets.delete(ws);
      if (userSockets.size === 0) {
        this.userSockets.delete(ws.userId);

        // Update user offline status
        User.findByIdAndUpdate(ws.userId, {
          isOnline: false,
          lastActive: new Date(),
        }).exec();

        // Broadcast offline status
        this.broadcastUserStatus(ws.userId, "offline");
      }
    }
  }

  broadcastUserStatus(userId, status) {
    const message = JSON.stringify({
      type: "user-status",
      userId,
      status,
    });

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client.userId !== userId) {
        client.send(message);
      }
    });
  }

  sendOnlineUsers(ws) {
    const onlineUsers = Array.from(this.clients.keys());
    ws.send(
      JSON.stringify({
        type: "online-users",
        users: onlineUsers,
      })
    );
  }

  sendError(ws, error) {
    ws.send(
      JSON.stringify({
        type: "error",
        error,
      })
    );
  }

  startHeartbeat() {
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          this.handleDisconnect(ws);
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }
}

export default new SocketServer();
