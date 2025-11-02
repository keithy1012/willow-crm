import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  role: string;
}

interface Message {
  id: string;
  conversationId: string;
  sender: User;
  content: string;
  timestamp: string;
  read: boolean;
  delivered: boolean;
}

interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

interface WebSocketContextType {
  isConnected: boolean;
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  onlineUsers: string[];
  typingUsers: { [conversationId: string]: User };
  currentUser: User; // Added currentUser to context
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
  currentUser,
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
    [conversationId: string]: User;
  }>({});

  // Connect to WebSocket
  // In WebSocketContext.tsx, update the connect function:

  const connect = useCallback(() => {
    try {
      // Get token using the CORRECT key name
      const authToken = token || localStorage.getItem("token"); // Changed from "authToken"

      console.log(
        "🔌 Connecting with token:",
        authToken ? authToken.substring(0, 30) + "..." : "NO TOKEN"
      );

      const wsUrl = process.env.REACT_APP_WS_URL || "ws://localhost:5050/ws";
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);

        // Check if we have a real JWT token (not test placeholders)
        if (authToken && authToken !== "user1" && authToken !== "user2") {
          console.log("🔐 Sending authentication");
          ws.current?.send(
            JSON.stringify({
              type: "auth",
              token: authToken,
            })
          );
        } else {
          console.warn(
            "⚠️ No valid auth token - running without authentication"
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
  }, [token]);

  // Handle incoming WebSocket messages
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
        setConversations((prev) => [...prev, data.conversation]);
        break;

      case "new-message":
        console.log("New message received:", data.message);
        // Handle new message inline to avoid stale closure
        setMessages((prev) => {
          // Check if message already exists
          if (prev.some((m) => m.id === data.message.id)) {
            return prev;
          }
          return [...prev, data.message];
        });

        // Update conversation list
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
        // Clear invalid token and redirect to login
        localStorage.removeItem("authToken");
        localStorage.removeItem("currentUser");
        // Optionally redirect to login
        // window.location.href = "/login";
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

      // Clear typing after 3 seconds
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

      // Reset unread count for conversation
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

  // Send a message
  const sendMessage = useCallback(
    (conversationId: string, content: string, recipientId: string) => {
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
        console.error("WebSocket not connected");
        return;
      }

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
    },
    [currentUser]
  );

  // Mark messages as read
  const markAsRead = useCallback(
    (conversationId: string, messageIds: string[]) => {
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;

      ws.current.send(
        JSON.stringify({
          type: "mark-as-read",
          data: {
            conversationId,
            messageIds,
          },
        })
      );
    },
    []
  );

  // Send typing indicator
  const sendTypingIndicator = useCallback(
    (conversationId: string, recipientId: string, isTyping: boolean) => {
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;

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
    },
    []
  );

  // Select a conversation
  const selectConversation = useCallback(
    (conversationId: string) => {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (!conversation) return;

      setActiveConversation(conversation);

      // Load messages for this conversation
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

  // Create a new conversation
  const createConversation = useCallback(
    async (recipientId: string): Promise<Conversation | null> => {
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
        console.error("WebSocket not connected");
        return null;
      }

      return new Promise((resolve) => {
        // Listen for response
        const handleResponse = (event: MessageEvent) => {
          const data = JSON.parse(event.data);
          if (data.type === "conversation-created") {
            ws.current?.removeEventListener("message", handleResponse);
            resolve(data.conversation);
          }
        };

        ws.current?.addEventListener("message", handleResponse);

        // Send create conversation request
        ws.current?.send(
          JSON.stringify({
            type: "create-conversation",
            data: { recipientId },
          })
        );

        // Timeout after 5 seconds
        setTimeout(() => {
          ws.current?.removeEventListener("message", handleResponse);
          resolve(null);
        }, 5000);
      });
    },
    []
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
    currentUser, // Add currentUser to the context value
    sendMessage,
    markAsRead,
    sendTypingIndicator,
    selectConversation,
    createConversation,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
