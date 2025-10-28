import { WebSocketServer } from "ws";
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
      let userId, user;

      if (token === "user1") {
        userId = "507f1f77bcf86cd799439011";
        user = {
          id: "507f1f77bcf86cd799439011",
          name: "Dr. Smith",
          username: "drsmith",
          avatar: null,
          role: "Doctor",
        };
      } else if (token === "user2") {
        userId = "507f1f77bcf86cd799439012";
        user = {
          id: "507f1f77bcf86cd799439012",
          name: "John Patient",
          username: "johnpatient",
          avatar: null,
          role: "Patient",
        };
      } else {
        console.error("Unknown token:", token);
        ws.close(1008, "Invalid token");
        return;
      }

      ws.userId = userId;
      ws.user = user;

      console.log(
        "✅ User authenticated:",
        user.name,
        "| ID:",
        userId,
        "| Token:",
        token
      );

      // Store in clients map
      this.clients.set(ws.userId, ws);

      if (!this.userSockets.has(ws.userId)) {
        this.userSockets.set(ws.userId, new Set());
      }
      this.userSockets.get(ws.userId).add(ws);

      // Send success
      ws.send(
        JSON.stringify({
          type: "auth-success",
          user: ws.user,
        })
      );

      // Send conversations
      await this.handleGetConversations(ws);

      // Send online users
      this.sendOnlineUsers(ws);
    } catch (error) {
      console.error("Auth error:", error);
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
        .populate("lastMessage")
        .sort("-updatedAt");

      const transformedConversations = conversations.map((conv) => {
        // Get the OTHER participant
        const otherParticipantId = conv.participants.find(
          (id) => id.toString() !== ws.userId
        );

        const otherParticipant =
          otherParticipantId?.toString() === "507f1f77bcf86cd799439011"
            ? {
                id: "507f1f77bcf86cd799439011",
                name: "Dr. Smith",
                username: "drsmith",
                avatar: null,
                role: "Doctor",
              }
            : {
                id: "507f1f77bcf86cd799439012",
                name: "John Patient",
                username: "johnpatient",
                avatar: null,
                role: "Patient",
              };

        return {
          id: conv._id.toString(),
          participants: [ws.user, otherParticipant],
          lastMessage: conv.lastMessage
            ? {
                content: conv.lastMessage.content,
                timestamp: conv.lastMessage.createdAt,
              }
            : null,
          unreadCount: 0,
          updatedAt: conv.updatedAt,
        };
      });

      console.log(
        `📋 Sent ${transformedConversations.length} conversations to ${ws.user.name}`
      );

      ws.send(
        JSON.stringify({
          type: "conversations-list",
          conversations: transformedConversations,
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
    const validRecipientId = recipientId || "507f1f77bcf86cd799439012";

    try {
      let conversation = await Conversation.findOne({
        participants: { $all: [ws.userId, validRecipientId] },
        type: "direct",
      });

      if (conversation) {
        console.log("Conversation already exists");
      } else {
        conversation = new Conversation({
          participants: [ws.userId, validRecipientId],
          type: "direct",
          createdBy: ws.userId,
          isActive: true,
        });
        await conversation.save();
        console.log("✅ New conversation created");
      }

      const otherParticipant =
        validRecipientId === "507f1f77bcf86cd799439011"
          ? {
              id: "507f1f77bcf86cd799439011",
              name: "Dr. Smith",
              username: "drsmith",
              role: "Doctor",
            }
          : {
              id: "507f1f77bcf86cd799439012",
              name: "John Patient",
              username: "johnpatient",
              role: "Patient",
            };

      ws.send(
        JSON.stringify({
          type: "conversation-created",
          conversation: {
            id: conversation._id.toString(),
            participants: [ws.user, otherParticipant],
            lastMessage: null,
            unreadCount: 0,
            updatedAt: conversation.updatedAt,
          },
        })
      );
    } catch (error) {
      console.error("Error creating conversation:", error);
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
