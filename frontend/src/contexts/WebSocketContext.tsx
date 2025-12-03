import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { messageService } from "api/services/message.service";
import { User } from "api/types/user.types";
import {
  Conversation,
  Message as MessageType,
  Participant,
} from "api/types/message.types";
import { encryptionService } from "api/services/encryption.service";

interface Message extends MessageType {
  delivered?: boolean;
}

interface WebSocketContextType {
  isConnected: boolean;
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  onlineUsers: string[];
  typingUsers: { [conversationId: string]: Participant };
  currentUser: Participant;
  sendMessage: (
    conversationId: string,
    content: string,
    recipientId: string
  ) => void;
  markAsRead: (conversationId: string, messageIds: string[]) => void;
  sendTypingIndicator: (
    conversationId: string,
    recipientId: string,
    isTyping: boolean
  ) => void;
  selectConversation: (conversationId: string) => void;
  createConversation: (recipientId: string) => Promise<Conversation | null>;
  refreshConversations: () => Promise<void>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context)
    throw new Error("useWebSocket must be used within WebSocketProvider");
  return {
    ...context,
    currentUserId: context.currentUser.id,
  };
};

interface WebSocketProviderProps {
  children: React.ReactNode;
  token: string;
  currentUser: User;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  token,
  currentUser: user,
}) => {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const typingTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<{
    [conversationId: string]: Participant;
  }>({});

  // Convert User to Participant format
  const currentUser: Participant = {
    id: user._id,
    name: `${user.firstName} ${user.lastName}`,
    username: user.username || user.email,
    avatar: user.profilePic,
    role: user.role,
  };

  // Initialize encryption on mount
  useEffect(() => {
    const initEncryption = async () => {
      try {
        // Pass userId to initialize keys from database
        await encryptionService.initializeKeys(user._id);
        console.log("🔐 Encryption initialized");
      } catch (error) {
        console.error("Failed to initialize encryption:", error);
      }
    };

    initEncryption();
  }, [user._id]);

  // Load conversations (fallback when WS is down)
  const refreshConversations = useCallback(async () => {
    try {
      const data = await messageService.conversations.getAll();
      setConversations(data);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  }, []);

  // Load messages (fallback when WS is down)
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const data = await messageService.messages.getByConversation(
        conversationId
      );
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  }, []);

  const connect = useCallback(() => {
    try {
      const authToken = token || localStorage.getItem("token");
      const wsUrl = process.env.REACT_APP_WS_URL || "ws://localhost:5050/ws";
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = async () => {
        console.log("✅ WebSocket connected");
        setIsConnected(true);

        if (authToken && authToken.length > 20) {
          ws.current?.send(
            JSON.stringify({
              type: "auth",
              token: authToken,
            })
          );

          // Send public key after authentication
          if (encryptionService.isInitialized()) {
            setTimeout(() => {
              try {
                const publicKey = encryptionService.getPublicKey();
                ws.current?.send(
                  JSON.stringify({
                    type: "register-public-key",
                    data: { publicKey },
                  })
                );
                console.log("📤 Public key sent to server");
              } catch (error) {
                console.error("Failed to send public key:", error);
              }
            }, 500);
          }
        }
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

      ws.current.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);

        // Attempt to reconnect after 3 seconds
        reconnectTimeout.current = setTimeout(() => {
          connect();
        }, 3000);
      };
    } catch (error) {
      console.error("Failed to connect:", error);
      setIsConnected(false);
    }
  }, [token]);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback(async (data: any) => {
    console.log("📨 Received WebSocket message:", data.type);

    switch (data.type) {
      case "auth-success":
        console.log("✅ Authenticated successfully");
        break;

      case "conversations-list":
        // Decrypt last message previews
        const conversationsWithDecryptedPreviews = await Promise.all(
          data.conversations.map(async (conv: any) => {
            if (conv.lastMessage?.encryptedContent) {
              try {
                const decryptedPreview = await encryptionService.decryptMessage(
                  conv.lastMessage.encryptedContent
                );
                return {
                  ...conv,
                  lastMessage: {
                    content:
                      decryptedPreview.substring(0, 50) +
                      (decryptedPreview.length > 50 ? "..." : ""),
                    timestamp: conv.lastMessage.timestamp,
                  },
                };
              } catch (error) {
                console.error("Failed to decrypt preview:", error);
                return {
                  ...conv,
                  lastMessage: {
                    content: "[Encrypted]",
                    timestamp: conv.lastMessage.timestamp,
                  },
                };
              }
            }
            return conv;
          })
        );

        setConversations(conversationsWithDecryptedPreviews);
        console.log(
          `📋 Loaded ${conversationsWithDecryptedPreviews.length} conversations`
        );
        break;

      case "conversation-created":
        setConversations((prev) => {
          if (prev.some((c: Conversation) => c.id === data.conversation.id)) {
            console.log("Conversation already exists");
            return prev;
          }
          console.log("✅ New conversation created");
          return [...prev, data.conversation];
        });
        break;

      case "new-message":
        try {
          console.log("📥 NEW message from someone else");
          console.log("Current user ID:", currentUser.id);
          console.log("Message sender ID:", data.message.sender.id);
          console.log(
            "Am I the sender?",
            data.message.sender.id === currentUser.id
          );

          // If I'm the sender, don't decrypt (message was encrypted for recipient)
          if (data.message.sender.id === currentUser.id) {
            console.log("⏭️ Skipping - this is my own message");
            // This shouldn't happen with new-message, but just in case
            break;
          }

          // Decrypt message from someone else
          console.log("🔓 Decrypting message from", data.message.sender.name);
          const decryptedContent = await encryptionService.decryptMessage(
            data.message.encryptedContent
          );

          console.log("✅ Message decrypted successfully");

          const decryptedMessage = {
            ...data.message,
            content: decryptedContent,
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === decryptedMessage.id)) {
              return prev;
            }
            return [...prev, decryptedMessage];
          });

          // Update conversation last message
          setConversations((prev) =>
            prev.map((conv) => {
              if (conv.id === decryptedMessage.conversationId) {
                return {
                  ...conv,
                  lastMessage: {
                    content:
                      decryptedContent.substring(0, 50) +
                      (decryptedContent.length > 50 ? "..." : ""),
                    timestamp: decryptedMessage.timestamp,
                  },
                  updatedAt: decryptedMessage.timestamp,
                  unreadCount: conv.unreadCount + 1,
                };
              }
              return conv;
            })
          );
        } catch (error) {
          console.error("❌ Failed to decrypt incoming message:", error);

          const fallbackMessage = {
            ...data.message,
            content: "[Unable to decrypt message]",
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === fallbackMessage.id)) {
              return prev;
            }
            return [...prev, fallbackMessage];
          });
        }
        break;

      case "message-sent":
        // Confirmation that our message was sent successfully
        console.log("✅ Message sent confirmation");
        console.log("TempId:", data.message.tempId);
        console.log("Real ID:", data.message.id);

        setMessages((prev) => {
          const optimisticMsg = prev.find((m) => m.id === data.message.tempId);
          console.log(
            "Found optimistic message with content:",
            optimisticMsg?.content
          );

          return prev.map((msg) => {
            if (msg.id === data.message.tempId) {
              // Keep the plaintext content from optimistic update
              return {
                ...msg,
                id: data.message.id, // Update to real ID from server
                delivered: true,
                timestamp: data.message.timestamp,
              };
            }
            return msg;
          });
        });
        break;

      case "messages-history":
        try {
          console.log(
            `🔓 Processing ${data.messages.length} messages from history...`
          );
          const processedMessages = await Promise.all(
            data.messages.map(async (msg: any) => {
              try {
                // Decrypt the message (backend already sent the correct encrypted version)
                console.log(
                  `Decrypting message ${msg.id} from ${msg.sender.name}`
                );
                console.log(
                  `Current user: ${currentUser.id}, Sender: ${msg.sender.id}`
                );
                console.log(
                  `Is my message: ${msg.sender.id === currentUser.id}`
                );
                console.log(`Has encryptedContent:`, !!msg.encryptedContent);

                const decryptedContent = await encryptionService.decryptMessage(
                  msg.encryptedContent
                );

                console.log(
                  `✅ Decrypted: ${decryptedContent.substring(0, 30)}...`
                );

                return {
                  ...msg,
                  content: decryptedContent,
                };
              } catch (error) {
                console.error("Failed to decrypt message:", msg.id, error);
                return {
                  ...msg,
                  content: "[Unable to decrypt this message]",
                };
              }
            })
          );
          setMessages(processedMessages);
          console.log(`✅ Loaded ${processedMessages.length} messages`);
        } catch (error) {
          console.error("Failed to process message history:", error);
        }
        break;

      case "typing-status":
        handleTypingStatus(data);
        break;

      case "messages-read":
        handleMessagesRead(data);
        break;

      case "user-status":
        handleUserStatus(data);
        break;

      case "online-users":
        setOnlineUsers(data.users);
        break;

      case "public-key-registered":
        console.log("✅ Public key registered with server");
        break;

      case "error":
        console.error("Server error:", data.error);
        break;

      case "auth-error":
        console.error("Authentication failed:", data.error);
        if (data.error === "Token expired" || data.error === "Invalid token") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          encryptionService.clearKeys();
        }
        break;

      default:
        console.log("Unknown message type:", data.type);
    }
  }, []);

  // Handle typing status
  const handleTypingStatus = useCallback((data: any) => {
    const { conversationId, user, isTyping } = data;

    if (isTyping) {
      setTypingUsers((prev) => ({ ...prev, [conversationId]: user }));

      if (typingTimeouts.current[conversationId]) {
        clearTimeout(typingTimeouts.current[conversationId]);
      }
      typingTimeouts.current[conversationId] = setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = { ...prev };
          delete updated[conversationId];
          return updated;
        });
      }, 3000);
    } else {
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[conversationId];
        return updated;
      });
    }
  }, []);

  // Handle messages read
  const handleMessagesRead = useCallback(
    (data: any) => {
      const { messageIds, conversationId } = data;
      setMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg.id) ? { ...msg, read: true } : msg
        )
      );

      if (activeConversation?.id === conversationId) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
          )
        );
      }
    },
    [activeConversation]
  );

  // Handle user status updates
  const handleUserStatus = useCallback((data: any) => {
    const { userId, status } = data;
    if (status === "online") {
      setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    } else {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    }
  }, []);

  // Send encrypted message
  const sendMessage = useCallback(
    async (conversationId: string, content: string, recipientId: string) => {
      const tempId = Date.now().toString();

      try {
        const conversation = conversations.find((c) => c.id === conversationId);
        const recipient = conversation?.participants.find(
          (p) => p.id === recipientId
        );

        if (!recipient?.publicKey) {
          alert("Recipient hasn't set up encryption yet.");
          return;
        }

        console.log("🔒 Encrypting message for both parties...");

        // Encrypt for recipient
        const encryptedForRecipient = await encryptionService.encryptMessage(
          content,
          recipient.publicKey
        );

        // Encrypt for myself (so I can decrypt after reload)
        const myPublicKey = encryptionService.getPublicKey();
        const encryptedForSelf = await encryptionService.encryptMessage(
          content,
          myPublicKey
        );

        // Optimistic UI
        const optimisticMessage: Message = {
          id: tempId,
          conversationId,
          sender: currentUser,
          content,
          timestamp: new Date().toISOString(),
          read: false,
          delivered: false,
        };

        setMessages((prev) => [...prev, optimisticMessage]);

        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(
            JSON.stringify({
              type: "send-message",
              data: {
                conversationId,
                recipientId,
                encryptedContent: encryptedForRecipient,
                encryptedContentSender: encryptedForSelf, // Add this
                tempId,
              },
            })
          );
        }
      } catch (error) {
        console.error("❌ Failed to encrypt/send:", error);
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      }
    },
    [currentUser, conversations]
  );

  // Mark messages as read
  const markAsRead = useCallback(
    async (conversationId: string, messageIds: string[]) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            type: "mark-as-read",
            data: {
              conversationId,
              messageIds,
            },
          })
        );
      }
    },
    []
  );

  // Send typing indicator
  const sendTypingIndicator = useCallback(
    async (conversationId: string, recipientId: string, isTyping: boolean) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            type: "typing",
            data: {
              conversationId,
              recipientId,
              isTyping,
            },
          })
        );
      }
    },
    []
  );

  // Select a conversation
  const selectConversation = useCallback(
    async (conversationId: string) => {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (!conversation) return;

      setActiveConversation(conversation);

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            type: "get-messages",
            data: { conversationId },
          })
        );
      }

      // Mark messages as read
      const unreadMessageIds = messages
        .filter(
          (m) =>
            m.conversationId === conversationId &&
            !m.read &&
            m.sender.id !== currentUser.id
        )
        .map((m) => m.id);

      if (unreadMessageIds.length > 0) {
        markAsRead(conversationId, unreadMessageIds);
      }
    },
    [conversations, messages, currentUser, markAsRead]
  );

  // Create conversation
  const createConversation = useCallback(
    async (recipientId: string): Promise<Conversation | null> => {
      // Check if conversation already exists
      const existingConversation = conversations.find(
        (conv) =>
          conv.participants.some((p: Participant) => p.id === recipientId) &&
          conv.participants.some((p: Participant) => p.id === currentUser.id)
      );

      if (existingConversation) {
        console.log("Conversation already exists");
        return existingConversation;
      }

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        return new Promise((resolve) => {
          let resolved = false;
          let timeoutId: NodeJS.Timeout;

          const handleResponse = (event: MessageEvent) => {
            if (resolved) return;

            try {
              const data = JSON.parse(event.data);
              if (
                data.type === "conversation-created" &&
                data.conversation?.participants?.some(
                  (p: Participant) => p.id === recipientId
                )
              ) {
                resolved = true;
                clearTimeout(timeoutId);
                ws.current?.removeEventListener("message", handleResponse);
                console.log("✅ Conversation created");
                resolve(data.conversation);
              }
            } catch (error) {
              console.error("Error parsing WebSocket message:", error);
            }
          };

          ws.current?.addEventListener("message", handleResponse);
          ws.current?.send(
            JSON.stringify({
              type: "create-conversation",
              data: { recipientId },
            })
          );

          // Timeout after 5 seconds
          timeoutId = setTimeout(() => {
            if (!resolved) {
              resolved = true;
              ws.current?.removeEventListener("message", handleResponse);
              console.error("❌ Conversation creation timeout");
              resolve(null);
            }
          }, 5000);
        });
      } else {
        console.error("❌ WebSocket not connected");
        return null;
      }
    },
    [conversations, currentUser]
  );

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      Object.values(typingTimeouts.current).forEach((timeout) =>
        clearTimeout(timeout)
      );
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  const value = {
    isConnected,
    conversations,
    activeConversation,
    messages,
    onlineUsers,
    typingUsers,
    currentUser,
    sendMessage,
    markAsRead,
    sendTypingIndicator,
    selectConversation,
    createConversation,
    refreshConversations,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
