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
  const reconnectTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
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

  // Load conversations using service (fallback when WS is down)
  const refreshConversations = useCallback(async () => {
    try {
      const data = await messageService.conversations.getAll();
      setConversations(data);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  }, []);

  // Load messages using service (fallback when WS is down)
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

      ws.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);

        if (authToken && authToken.length > 20) {
          ws.current?.send(
            JSON.stringify({
              type: "auth",
              token: authToken,
            })
          );
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
  }, [token, refreshConversations]);

  // Handle incoming WebSocket messages - keep as is
  const handleWebSocketMessage = useCallback((data: any) => {
    console.log("Received WebSocket message:", data.type, data);

    switch (data.type) {
      case "auth-success":
        console.log("Authenticated successfully");
        break;

      case "conversations-list":
        setConversations(data.conversations);
        break;

      case "conversation-created":
        setConversations((prev) => {
          // Check if conversation already exists with proper typing
          if (prev.some((c: Conversation) => c.id === data.conversation.id)) {
            console.log("Conversation already exists, not adding duplicate");
            return prev;
          }
          console.log("Adding new conversation:", data.conversation.id);
          return [...prev, data.conversation];
        });
        break;

      case "new-message":
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) {
            return prev;
          }
          return [...prev, data.message];
        });

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === data.message.conversationId) {
              return {
                ...conv,
                lastMessage: data.message,
                updatedAt: data.message.timestamp,
                unreadCount: conv.unreadCount + 1,
              };
            }
            return conv;
          })
        );
        break;

      case "message-sent":
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.message.tempId || msg.id === data.message.id
              ? { ...data.message }
              : msg
          )
        );
        break;

      case "messages-history":
        setMessages(data.messages);
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

      case "error":
        console.error("Server error:", data.error);
        break;

      case "auth-error":
        console.error("Authentication failed:", data.error);
        if (data.error === "Token expired" || data.error === "Invalid token") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
        break;

      default:
        console.log("Unknown message type:", data.type);
    }
  }, []);

  // Handle typing status - keep as is
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

  // Handle messages read - keep as is
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

  // Handle user status updates - keep as is
  const handleUserStatus = useCallback((data: any) => {
    const { userId, status } = data;
    if (status === "online") {
      setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    } else {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    }
  }, []);

  // Send a message with fallback to HTTP
  const sendMessage = useCallback(
    async (conversationId: string, content: string, recipientId: string) => {
      const tempId = Date.now().toString();
      const optimisticMessage: Message = {
        id: tempId,
        conversationId,
        sender: currentUser,
        content,
        timestamp: new Date().toISOString(),
        read: false,
        delivered: false,
      };

      // Add optimistic message
      setMessages((prev) => [...prev, optimisticMessage]);

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        // Send via WebSocket
        ws.current.send(
          JSON.stringify({
            type: "send-message",
            data: {
              conversationId,
              recipientId,
              content,
              tempId,
            },
          })
        );
      } else {
        // Fallback to HTTP
        try {
          const response = await messageService.messages.send(
            conversationId,
            content,
            recipientId
          );

          // Replace optimistic message with real one
          setMessages((prev) =>
            prev.map((msg) => (msg.id === tempId ? response.message : msg))
          );
        } catch (error) {
          console.error("Failed to send message:", error);
          // Remove optimistic message on error
          setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        }
      }
    },
    [currentUser]
  );

  // Mark messages as read with fallback
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
      } else {
        // Fallback to HTTP
        try {
          await messageService.conversations.markAsRead(conversationId);
        } catch (error) {
          console.error("Failed to mark as read:", error);
        }
      }
    },
    []
  );

  // Send typing indicator with fallback
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
      } else {
        // Fallback to HTTP
        try {
          if (isTyping) {
            await messageService.typing.start(conversationId, recipientId);
          } else {
            await messageService.typing.stop(conversationId, recipientId);
          }
        } catch (error) {
          console.error("Failed to send typing indicator:", error);
        }
      }
    },
    []
  );

  // Select a conversation with fallback
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
      } else {
        // Fallback to HTTP
        await loadMessages(conversationId);
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
    [conversations, messages, currentUser, markAsRead, loadMessages]
  );

  // Create conversation with fallback
  const createConversation = useCallback(
    async (recipientId: string): Promise<Conversation | null> => {
      // Check if conversation already exists with proper typing
      const existingConversation = conversations.find(
        (conv) =>
          conv.participants.some((p: Participant) => p.id === recipientId) &&
          conv.participants.some((p: Participant) => p.id === currentUser.id)
      );

      if (existingConversation) {
        console.log("Conversation already exists, returning existing");
        return existingConversation;
      }

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        return new Promise((resolve) => {
          let resolved = false;
          let timeoutId: NodeJS.Timeout;

          const handleResponse = (event: MessageEvent) => {
            if (resolved) return; // Prevent multiple resolutions

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
              resolve(null);
            }
          }, 5000);
        });
      } else {
        // Fallback to HTTP
        try {
          const response = await messageService.conversations.create(
            recipientId
          );
          if (response.conversation) {
            // Add to conversations if not already there
            setConversations((prev) => {
              if (
                !prev.some(
                  (c: Conversation) => c.id === response.conversation.id
                )
              ) {
                return [...prev, response.conversation];
              }
              return prev;
            });
            return response.conversation;
          }
          return null;
        } catch (error) {
          console.error("Failed to create conversation:", error);
          return null;
        }
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
