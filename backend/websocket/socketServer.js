import { WebSocketServer } from "ws";
import Conversation from "../models/messaging/Conversation.js";
import Message from "../models/messaging/Message.js";
import User from "../models/users/User.js";
import AuditLog from "../models/messaging/AuditLog.js";
import { verifyToken } from "../middleware/authentication.js";

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
      // Store IP address for audit logging
      ws.ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
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

      case "register-public-key":
        await this.handleRegisterPublicKey(ws, message.data);
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

  // HIPAA Audit Logging
  async logAuditEvent(userId, action, resourceType, resourceId, metadata = {}) {
    try {
      await AuditLog.create({
        userId,
        action,
        resourceType,
        resourceId,
        metadata,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Failed to log audit event:", error);
    }
  }

  async handleAuth(ws, token) {
    try {
      if (!token || token.trim() === "") {
        ws.send(
          JSON.stringify({
            type: "auth-error",
            error: "No token provided",
          })
        );
        ws.close(1008, "No token");
        return;
      }

      let decoded;
      try {
        decoded = verifyToken(token);
      } catch (error) {
        // HIPAA: Log failed login attempt
        await this.logAuditEvent(null, "FAILED_LOGIN", "USER", null, {
          reason: error.name,
          ipAddress: ws.ipAddress,
        });

        if (error.name === "TokenExpiredError") {
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
              error: "Invalid token",
            })
          );
        }
        ws.close(1008, "Authentication failed");
        return;
      }

      const userId = decoded.id;

      const user = await User.findById(userId).select(
        "firstName lastName email username profilePic role isOnline publicKey"
      );

      if (!user) {
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
        publicKey: user.publicKey,
      };

      this.clients.set(ws.userId, ws);

      if (!this.userSockets.has(ws.userId)) {
        this.userSockets.set(ws.userId, new Set());
      }
      this.userSockets.get(ws.userId).add(ws);

      await User.findByIdAndUpdate(user._id, {
        isOnline: true,
        lastActive: new Date(),
      });

      // HIPAA: Log successful login
      await this.logAuditEvent(userId, "LOGIN", "USER", userId, {
        ipAddress: ws.ipAddress,
      });

      ws.send(
        JSON.stringify({
          type: "auth-success",
          user: ws.user,
        })
      );

      await this.handleGetConversations(ws);
      this.sendOnlineUsers(ws);
      this.broadcastUserStatus(ws.userId, "online");
    } catch (error) {
      console.error("WebSocket auth error:", error);
      ws.send(
        JSON.stringify({
          type: "auth-error",
          error: "Authentication failed",
        })
      );
      ws.close(1008, "Authentication failed");
    }
  }

  async handleRegisterPublicKey(ws, data) {
    if (!ws.userId) {
      this.sendError(ws, "Not authenticated");
      return;
    }

    try {
      const { publicKey } = data;

      if (!publicKey || publicKey.length < 20) {
        this.sendError(ws, "Invalid public key");
        return;
      }

      await User.findByIdAndUpdate(ws.userId, {
        publicKey: publicKey,
        keyRotatedAt: new Date(),
      });

      // Update ws.user to include publicKey
      ws.user.publicKey = publicKey;

      console.log(`✅ Public key registered for user ${ws.userId}`);

      ws.send(
        JSON.stringify({
          type: "public-key-registered",
          success: true,
        })
      );

      // HIPAA: Log key registration
      await this.logAuditEvent(ws.userId, "KEY_REGISTERED", "USER", ws.userId);
    } catch (error) {
      console.error("Error registering public key:", error);
      this.sendError(ws, "Failed to register public key");
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
        .populate(
          "participants",
          "firstName lastName username profilePic role publicKey"
        )
        .populate({
          path: "lastMessage",
          populate: {
            path: "sender",
            select: "firstName lastName _id",
          },
        })
        .sort("-updatedAt");

      const transformedConversations = await Promise.all(
        conversations.map(async (conv) => {
          const otherParticipant = conv.participants.find(
            (p) => p && p._id && p._id.toString() !== ws.userId
          );

          if (!otherParticipant) {
            return null;
          }

          // Handle last message preview
          let lastMessageContent = null;
          if (conv.lastMessage) {
            // Determine which encrypted version to use
            const lastMsg = conv.lastMessage;
            let encryptedContent = lastMsg.encryptedContent;

            // If I'm the sender, use my copy
            if (
              lastMsg.sender &&
              lastMsg.sender._id.toString() === ws.userId &&
              lastMsg.encryptedContentSender
            ) {
              encryptedContent = lastMsg.encryptedContentSender;
            }

            // Send encrypted content - let frontend decrypt it
            lastMessageContent = {
              encryptedContent: encryptedContent,
              timestamp: conv.lastMessage.createdAt,
              senderId: lastMsg.sender?._id?.toString(),
            };
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
                publicKey: otherParticipant.publicKey,
              },
            ],
            lastMessage: lastMessageContent,
            unreadCount: 0,
            updatedAt: conv.updatedAt,
          };
        })
      );

      const validConversations = transformedConversations.filter(
        (c) => c !== null
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
        .populate(
          "sender",
          "firstName lastName username profilePic role publicKey"
        )
        .sort("createdAt")
        .limit(100);

      const transformedMessages = messages.map((msg) => {
        const sender = msg.sender;

        // Determine which encrypted version to send
        // If I'm the sender, send encryptedContentSender (if exists), otherwise encryptedContent
        let encryptedContent = msg.encryptedContent;

        if (sender._id.toString() === ws.userId && msg.encryptedContentSender) {
          // I'm the sender and there's a copy encrypted for me
          encryptedContent = msg.encryptedContentSender;
          console.log(`📨 Sending sender's copy for message ${msg._id}`);
        } else if (sender._id.toString() === ws.userId) {
          // I'm the sender but no sender copy exists
          console.log(`⚠️ No sender copy exists for message ${msg._id}`);
        }

        return {
          id: msg._id.toString(),
          conversationId: msg.conversation.toString(),
          sender: {
            id: sender._id.toString(),
            name: `${sender.firstName} ${sender.lastName}`,
            username: sender.username,
            avatar: sender.profilePic,
            role: sender.role,
          },
          encryptedContent: encryptedContent,
          timestamp: msg.createdAt,
          read: msg.read || false,
          delivered: msg.delivered || true,
        };
      });

      ws.send(
        JSON.stringify({
          type: "messages-history",
          messages: transformedMessages,
        })
      );

      // HIPAA: Log message access
      await this.logAuditEvent(
        ws.userId,
        "MESSAGES_ACCESSED",
        "CONVERSATION",
        conversationId,
        {
          messageCount: transformedMessages.length,
        }
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

    const { conversationId, encryptedContent, encryptedContentSender, tempId } =
      data;

    // Validate encrypted content for recipient
    if (
      !encryptedContent ||
      !encryptedContent.ciphertext ||
      !encryptedContent.ephemeralPublicKey ||
      !encryptedContent.nonce
    ) {
      this.sendError(ws, "Invalid encrypted message format");
      return;
    }

    try {
      // Save encrypted message (server never sees plaintext!)
      const messageData = {
        conversation: conversationId,
        sender: ws.userId,
        encryptedContent: {
          ciphertext: encryptedContent.ciphertext,
          ephemeralPublicKey: encryptedContent.ephemeralPublicKey,
          nonce: encryptedContent.nonce,
        },
        delivered: true,
        read: false,
        sentFromIP: ws.ipAddress,
        deliveredAt: new Date(),
      };

      // If sender encrypted a copy for themselves, store it too
      if (
        encryptedContentSender &&
        encryptedContentSender.ciphertext &&
        encryptedContentSender.ephemeralPublicKey &&
        encryptedContentSender.nonce
      ) {
        messageData.encryptedContentSender = {
          ciphertext: encryptedContentSender.ciphertext,
          ephemeralPublicKey: encryptedContentSender.ephemeralPublicKey,
          nonce: encryptedContentSender.nonce,
        };
      }

      const message = new Message(messageData);
      await message.save();

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
        updatedAt: new Date(),
      });

      const messagePayload = {
        id: message._id.toString(),
        conversationId: conversationId,
        sender: ws.user,
        encryptedContent: message.encryptedContent,
        encryptedContentSender: message.encryptedContentSender, // Include sender's copy if exists
        timestamp: message.createdAt.toISOString(),
        read: false,
        delivered: true,
        tempId: tempId,
      };

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
          recipientWs.send(
            JSON.stringify({
              type: "new-message",
              message: messagePayload,
            })
          );
        }
      }

      // HIPAA: Log message sent
      await this.logAuditEvent(
        ws.userId,
        "MESSAGE_SENT",
        "MESSAGE",
        message._id,
        {
          conversationId,
          recipientId: recipientId?.toString(),
          encrypted: true,
        }
      );
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
      const otherUser = await User.findById(recipientId).select(
        "firstName lastName username profilePic role publicKey"
      );

      if (!otherUser) {
        this.sendError(ws, "Recipient not found");
        return;
      }

      let conversation = await Conversation.findOne({
        participants: { $all: [ws.userId, recipientId] },
        type: "direct",
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [ws.userId, recipientId],
          type: "direct",
          createdBy: ws.userId,
          isActive: true,
        });
        await conversation.save();

        // HIPAA: Log conversation creation
        await this.logAuditEvent(
          ws.userId,
          "CONVERSATION_CREATED",
          "CONVERSATION",
          conversation._id,
          {
            recipientId,
          }
        );
      }

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
              publicKey: otherUser.publicKey,
            },
          ],
          lastMessage: null,
          unreadCount: 0,
          updatedAt: conversation.updatedAt,
        },
      };

      ws.send(JSON.stringify(responsePayload));
      await this.handleGetConversations(ws);
    } catch (error) {
      console.error("Error handling conversation:", error);
      this.sendError(ws, "Failed to handle conversation");
    }
  }

  handleDisconnect(ws) {
    if (!ws.userId) return;

    // HIPAA: Log logout
    this.logAuditEvent(ws.userId, "LOGOUT", "USER", ws.userId, {
      ipAddress: ws.ipAddress,
    });

    this.clients.delete(ws.userId);

    const userSockets = this.userSockets.get(ws.userId);
    if (userSockets) {
      userSockets.delete(ws);
      if (userSockets.size === 0) {
        this.userSockets.delete(ws.userId);

        User.findByIdAndUpdate(ws.userId, {
          isOnline: false,
          lastActive: new Date(),
        }).exec();

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
