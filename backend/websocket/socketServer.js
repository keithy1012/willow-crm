import { WebSocketServer } from "ws";
import Conversation from "../models/messaging/Conversation.js";
import Message from "../models/messaging/Message.js";
import jwt from "jsonwebtoken";
import User from "../models/users/User.js";

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
      console.log("🔐 Auth attempt");

      if (!token || token.trim() === "") {
        console.log("❌ No token provided");
        ws.send(
          JSON.stringify({
            type: "auth-error",
            error: "No token provided",
          })
        );
        ws.close(1008, "No token");
        return;
      }

      const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.id).select(
        "firstName lastName email username profilePic role isOnline"
      );

      if (!user) {
        console.log("❌ User not found");
        ws.send(
          JSON.stringify({
            type: "auth-error",
            error: "User not found",
          })
        );
        ws.close(1008, "User not found");
        return;
      }

      // Store user info on WebSocket connection
      ws.userId = user._id.toString();
      ws.user = {
        id: user._id.toString(),
        name: `${user.firstName} ${user.lastName}`,
        username: user.username,
        avatar: user.profilePic,
        role: user.role,
      };

      console.log("✅ User authenticated:", ws.user.name, "| ID:", ws.userId);

      // Store in clients map
      this.clients.set(ws.userId, ws);

      if (!this.userSockets.has(ws.userId)) {
        this.userSockets.set(ws.userId, new Set());
      }
      this.userSockets.get(ws.userId).add(ws);

      // Update user online status in database
      await User.findByIdAndUpdate(user._id, {
        isOnline: true,
        lastActive: new Date(),
      });

      // Send success response
      ws.send(
        JSON.stringify({
          type: "auth-success",
          user: ws.user,
        })
      );

      // Load conversations
      await this.handleGetConversations(ws);

      // Send online users
      this.sendOnlineUsers(ws);

      // Broadcast that this user is online
      this.broadcastUserStatus(ws.userId, "online");
    } catch (error) {
      console.error("❌ Auth error:", error.message);

      if (error.name === "JsonWebTokenError") {
        ws.send(
          JSON.stringify({
            type: "auth-error",
            error: "Invalid token",
          })
        );
      } else if (error.name === "TokenExpiredError") {
        ws.send(
          JSON.stringify({
            type: "auth-error",
            error: "Token expired",
          })
        );
      } else {
        ws.send(
          JSON.stringify({
            type: "auth-error",
            error: "Authentication failed",
          })
        );
      }

      ws.close(1008, "Authentication failed");
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

      const transformedConversations = await Promise.all(
        conversations.map(async (conv) => {
          // Get the OTHER participant
          const otherParticipant = conv.participants.find(
            (p) => p && p._id && p._id.toString() !== ws.userId
          );

          // Skip this conversation if other participant doesn't exist
          if (!otherParticipant) {
            console.log(
              `⚠️ Skipping conversation ${conv._id} - participant not found`
            );
            return null;
          }

          return {
            id: conv._id.toString(),
            participants: [
              ws.user,
              {
                id: otherParticipant._id.toString(),
                name: `${otherParticipant.firstName} ${otherParticipant.lastName}`,
                username: otherParticipant.username,
                avatar: otherParticipant.profilePic,
                role: otherParticipant.role,
              },
            ],
            lastMessage: conv.lastMessage
              ? {
                  content: conv.lastMessage.content,
                  timestamp: conv.lastMessage.createdAt,
                }
              : null,
            unreadCount: 0,
            updatedAt: conv.updatedAt,
          };
        })
      );

      // Filter out null conversations
      const validConversations = transformedConversations.filter(
        (c) => c !== null
      );

      console.log(
        `📋 Sent ${validConversations.length} conversations to ${ws.user.name}`
      );

      ws.send(
        JSON.stringify({
          type: "conversations-list",
          conversations: validConversations,
        })
      );
    } catch (error) {
      console.error("Error fetching conversations:", error);
      ws.send(
        JSON.stringify({
          type: "conversations-list",
          conversations: [],
        })
      );
    }
  }

  async handleGetMessages(ws, data) {
    if (!ws.userId) {
      this.sendError(ws, "Not authenticated");
      return;
    }

    const { conversationId } = data;

    try {
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: ws.userId,
      });

      if (!conversation) {
        console.log("Conversation not found or user not participant");
        ws.send(
          JSON.stringify({
            type: "messages-history",
            messages: [],
          })
        );
        return;
      }

      const messages = await Message.find({
        conversation: conversationId,
      })
        .sort("createdAt")
        .limit(50);

      const transformedMessages = messages.map((msg) => {
        const senderId = msg.sender.toString();
        const senderInfo =
          senderId === "507f1f77bcf86cd799439011"
            ? {
                id: "507f1f77bcf86cd799439011",
                name: "Dr. Smith",
                username: "drsmith",
                avatar: null,
              }
            : {
                id: "507f1f77bcf86cd799439012",
                name: "John Patient",
                username: "johnpatient",
                avatar: null,
              };

        return {
          id: msg._id.toString(),
          conversationId: msg.conversation.toString(),
          sender: senderInfo,
          content: msg.content,
          timestamp: msg.createdAt,
          read: msg.read || false,
          delivered: msg.delivered || true,
        };
      });

      console.log(
        `💬 Sent ${transformedMessages.length} messages to ${ws.user.name}`
      );

      ws.send(
        JSON.stringify({
          type: "messages-history",
          messages: transformedMessages,
        })
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
      ws.send(
        JSON.stringify({
          type: "messages-history",
          messages: [],
        })
      );
    }
  }

  async handleSendMessage(ws, data) {
    if (!ws.userId) {
      this.sendError(ws, "Not authenticated");
      return;
    }

    const { conversationId, content, tempId } = data;

    try {
      console.log(
        `📤 ${ws.user.name} sending message: "${content}" to conversation ${conversationId}`
      );

      // Save to database
      const message = new Message({
        conversation: conversationId,
        sender: ws.userId,
        content: content,
        delivered: true,
        read: false,
      });

      await message.save();

      // Update conversation
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
        updatedAt: new Date(),
      });

      const messagePayload = {
        id: message._id.toString(),
        conversationId: conversationId,
        sender: {
          id: ws.userId,
          name: ws.user.name,
          username: ws.user.username,
          avatar: ws.user.avatar,
        },
        content: content,
        timestamp: message.createdAt.toISOString(),
        read: false,
        delivered: true,
        tempId: tempId,
      };

      console.log(`✅ Message saved with ID: ${message._id}`);

      // Send confirmation to sender
      ws.send(
        JSON.stringify({
          type: "message-sent",
          message: messagePayload,
        })
      );

      // Send to recipient
      const conversation = await Conversation.findById(conversationId);
      const recipientId = conversation.participants.find(
        (id) => id.toString() !== ws.userId
      );

      if (recipientId) {
        const recipientWs = this.clients.get(recipientId.toString());
        if (recipientWs && recipientWs.readyState === 1) {
          // WebSocket.OPEN = 1
          console.log(`📨 Forwarding message to ${recipientWs.user.name}`);
          recipientWs.send(
            JSON.stringify({
              type: "new-message",
              message: messagePayload,
            })
          );
        } else {
          console.log(`⚠️ Recipient ${recipientId} is not online`);
        }
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
    if (recipientWs && recipientWs.readyState === 1) {
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

  async handleCreateConversation(ws, data) {
    if (!ws.userId) {
      this.sendError(ws, "Not authenticated");
      return;
    }

    const { recipientId } = data;

    if (!recipientId) {
      this.sendError(ws, "Recipient ID required");
      return;
    }

    try {
      console.log(
        `🔍 Creating conversation between ${ws.userId} and ${recipientId}`
      );

      // Find existing conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [ws.userId, recipientId] },
        type: "direct",
      });

      if (!conversation) {
        // Create new conversation
        conversation = new Conversation({
          participants: [ws.userId, recipientId],
          type: "direct",
          createdBy: ws.userId,
          isActive: true,
        });
        await conversation.save();
        console.log("✅ New conversation created:", conversation._id);
      } else {
        console.log("📋 Conversation already exists:", conversation._id);
      }

      // Get the other user's info from database
      const otherUser = await User.findById(recipientId).select(
        "firstName lastName username profilePic role"
      );

      if (!otherUser) {
        console.error(`❌ Recipient user ${recipientId} not found in database`);
        this.sendError(ws, "Recipient not found");
        return;
      }

      console.log(
        `✅ Found other user: ${otherUser.firstName} ${otherUser.lastName}`
      );

      const responsePayload = {
        type: "conversation-created",
        conversation: {
          id: conversation._id.toString(),
          participants: [
            ws.user,
            {
              id: otherUser._id.toString(),
              name: `${otherUser.firstName} ${otherUser.lastName}`,
              username: otherUser.username,
              avatar: otherUser.profilePic,
              role: otherUser.role,
            },
          ],
          lastMessage: null,
          unreadCount: 0,
          updatedAt: conversation.updatedAt,
        },
      };

      ws.send(JSON.stringify(responsePayload));
      console.log(`📤 Sent conversation to ${ws.user.name}`);
    } catch (error) {
      console.error("❌ Error creating conversation:", error);
      this.sendError(ws, "Failed to create conversation");
    }
  }

  handleDisconnect(ws) {
    if (!ws.userId) return;

    console.log(`❌ User ${ws.user?.name || ws.userId} disconnected`);

    this.clients.delete(ws.userId);

    const userSockets = this.userSockets.get(ws.userId);
    if (userSockets) {
      userSockets.delete(ws);
      if (userSockets.size === 0) {
        this.userSockets.delete(ws.userId);

        // Update user offline status in database
        User.findByIdAndUpdate(ws.userId, {
          isOnline: false,
          lastActive: new Date(),
        }).exec();

        // Broadcast offline status
        this.broadcastUserStatus(ws.userId, "offline");
      }
    }
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
  broadcastUserStatus(userId, status) {
    const message = JSON.stringify({
      type: "user-status",
      userId,
      status,
    });

    this.wss.clients.forEach((client) => {
      if (client.readyState === 1 && client.userId !== userId) {
        client.send(message);
      }
    });
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
