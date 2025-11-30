import ConversationPreview from "components/card/MessagePreviewCard";
import ProfileHeaderCard from "components/card/ProfileHeaderCard";
import LongTextArea from "components/input/LongTextArea";
import SmallSearchBar from "components/input/SmallSearchBar";
import Message from "components/messages/Message";
import UserSearchModal from "components/input/UserSearch";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { NotePencil } from "phosphor-react";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { messageService } from "api/services/message.service";
import { UserSearchResult } from "api/types/user.types";
import { Participant } from "api/types/message.types";
const EmptyMessages = "/EmptyMessages.png";

interface ConversationGroup {
  label: string;
  conversations: any[];
}

interface BaseMessagesProps {
  userRole: "Doctor" | "Patient" | "Ops" | "IT" | "Finance";
  allowNewConversations?: boolean;
  showOnlineStatus?: boolean;
  customHeader?: React.ReactNode;
  conversationFilters?: {
    showOnlyRole?: string[];
    excludeRoles?: string[];
  };
  onConversationSelect?: (conversationId: string) => void;
  customActions?: React.ReactNode;
  onViewProfile?: (userId: string) => void;
}

const BaseMessages: React.FC<BaseMessagesProps> = ({
  userRole,
  allowNewConversations = true,
  showOnlineStatus = true,
  customHeader,
  conversationFilters,
  onConversationSelect,
  customActions,
  onViewProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const {
    isConnected,
    conversations,
    activeConversation,
    messages,
    onlineUsers,
    typingUsers,
    sendMessage,
    selectConversation,
    sendTypingIndicator,
    createConversation,
    currentUserId,
  } = useWebSocket();

  // Filter conversations based on role-specific rules
  const filteredByRole = useMemo(() => {
    if (!conversationFilters || !currentUserId) return conversations;

    return conversations.filter((conv) => {
      const otherParticipant = conv.participants.find(
        (p: Participant) => p.id !== currentUserId
      );

      if (!otherParticipant) return false;

      const participantRole = otherParticipant.role;
      if (!participantRole) return true;

      if (conversationFilters.showOnlyRole) {
        return conversationFilters.showOnlyRole.includes(participantRole);
      }

      if (conversationFilters.excludeRoles) {
        return !conversationFilters.excludeRoles.includes(participantRole);
      }

      return true;
    });
  }, [conversations, conversationFilters, currentUserId]);

  // Group conversations by date
  const conversationGroups = useMemo((): ConversationGroup[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups: ConversationGroup[] = [
      { label: "Today", conversations: [] },
      { label: "Yesterday", conversations: [] },
      { label: "Last Week", conversations: [] },
      { label: "Older", conversations: [] },
    ];

    const searchFiltered = filteredByRole.filter((conv) => {
      if (!searchQuery) return true;
      const otherParticipant = conv.participants.find(
        (p: any) => p.id !== currentUserId
      );
      if (!otherParticipant) return false;

      const searchLower = searchQuery.toLowerCase();
      return (
        otherParticipant.name.toLowerCase().includes(searchLower) ||
        otherParticipant.username.toLowerCase().includes(searchLower) ||
        conv.lastMessage?.content.toLowerCase().includes(searchLower)
      );
    });

    searchFiltered.forEach((conv) => {
      const messageDate = new Date(conv.updatedAt);
      const otherParticipant = conv.participants.find(
        (p: any) => p.id !== currentUserId
      );

      const transformedConv = {
        id: conv.id,
        user: otherParticipant || { name: "Unknown", username: "unknown" },
        lastMessage: conv.lastMessage?.content || "No messages yet",
        timestamp: conv.updatedAt,
        hasUnread: conv.unreadCount > 0,
        isActive: activeConversation?.id === conv.id,
        isOnline:
          showOnlineStatus && otherParticipant
            ? onlineUsers.includes(otherParticipant.id)
            : false,
      };

      if (messageDate >= today) {
        groups[0].conversations.push(transformedConv);
      } else if (messageDate >= yesterday) {
        groups[1].conversations.push(transformedConv);
      } else if (messageDate >= lastWeek) {
        groups[2].conversations.push(transformedConv);
      } else {
        groups[3].conversations.push(transformedConv);
      }
    });

    return groups.filter((group) => group.conversations.length > 0);
  }, [
    filteredByRole,
    searchQuery,
    activeConversation,
    onlineUsers,
    currentUserId,
    showOnlineStatus,
  ]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentUserId) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading user session...</p>
      </div>
    );
  }

  // All handler functions
  const handleNewConversation = () => {
    setShowUserSearch(true);
  };

  const handleUserSelected = async (userId: string, user: UserSearchResult) => {
    if (isCreatingConversation) {
      console.log("Already creating conversation, ignoring duplicate call");
      return;
    }

    console.log(
      "Creating conversation with:",
      user.fullName || `${user.firstName} ${user.lastName}`
    );

    setIsCreatingConversation(true);

    try {
      if (!isConnected || !createConversation) {
        console.error("WebSocket not connected");
        alert("Unable to create conversation. Please check your connection.");
        return;
      }

      const newConversation = await createConversation(userId);
      if (newConversation) {
        selectConversation(newConversation.id);
        setShowUserSearch(false);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Failed to create conversation. Please try again.");
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim() || !activeConversation) return;

    const recipient = activeConversation.participants.find(
      (p) => p.id !== currentUserId
    );
    if (!recipient) return;

    sendMessage(activeConversation.id, text, recipient.id);

    if (isTyping) {
      handleStopTyping();
    }
  };

  const handleTyping = () => {
    if (!activeConversation || isTyping) return;

    const recipient = activeConversation.participants.find(
      (p) => p.id !== currentUserId
    );
    if (!recipient) return;

    setIsTyping(true);
    sendTypingIndicator(activeConversation.id, recipient.id, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  };

  const handleStopTyping = () => {
    if (!activeConversation || !isTyping) return;

    const recipient = activeConversation.participants.find(
      (p) => p.id !== currentUserId
    );
    if (!recipient) return;

    setIsTyping(false);
    sendTypingIndicator(activeConversation.id, recipient.id, false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleSearchClear = () => {
    setSearchQuery("");
  };

  const handleConversationClick = (conversationId: string) => {
    selectConversation(conversationId);
    onConversationSelect?.(conversationId);
  };

  const activeRecipient = activeConversation?.participants.find(
    (p) => p.id !== currentUserId
  );
  const isRecipientTyping =
    activeConversation && typingUsers[activeConversation.id];

  const getTitle = () => {
    switch (userRole) {
      case "Doctor":
        return "Messages";
      case "Patient":
        return "Doctor Messages";
      default:
        return "Messages";
    }
  };

  return (
    <div className="w-full h-screen flex flex-row bg-foreground">
      <div className="w-1/3 p-6 space-y-3 h-screen border-r bg-background border-stroke flex flex-col">
        {customHeader || (
          <div className="flex flex-row justify-between items-center">
            <div className="flex items-center gap-2">
              <h2 className="text-xl">{getTitle()}</h2>
              {!isConnected && (
                <span className="text-xs text-error bg-error/10 px-2 py-1 rounded">
                  Disconnected
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {customActions}
              {allowNewConversations && (
                <NotePencil
                  size={24}
                  className="text-primaryText hover:text-primaryText/70 cursor-pointer transition-colors"
                  onClick={handleNewConversation}
                />
              )}
            </div>
          </div>
        )}

        <SmallSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={handleSearchClear}
          placeholder="Search conversations..."
        />

        <div className="flex-1 overflow-y-auto space-y-3">
          {conversationGroups.length > 0 ? (
            conversationGroups.map((group) => (
              <div key={group.label} className="space-y-3">
                <p className="text-md font-medium text-secondaryText">
                  {group.label}
                </p>
                {group.conversations.map((conversation) => (
                  <ConversationPreview
                    key={conversation.id}
                    user={conversation.user}
                    lastMessage={conversation.lastMessage}
                    timestamp={conversation.timestamp}
                    hasUnread={conversation.hasUnread}
                    isActive={conversation.isActive}
                    onClick={() => handleConversationClick(conversation.id)}
                  />
                ))}
              </div>
            ))
          ) : (
            <div className="flex flex-col mt-12 items-center justify-start gap-6 h-full text-secondaryText">
              <p className="text-sm">
                You have no messages yet. Start a new conversation to begin
                chatting.
              </p>
              {allowNewConversations && (
                <button
                  onClick={handleNewConversation}
                  className="mt-2 text-primary hover:underline text-sm"
                >
                  Start a new conversation
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex w-2/3 flex-col">
        {activeConversation && activeRecipient ? (
          <>
            <div className="px-6 pt-6 mb-3 flex-shrink-0">
              <div className="px-6 pt-6 mb-3 flex-shrink-0">
                <ProfileHeaderCard
                  name={activeRecipient.name}
                  username={activeRecipient.username}
                  userId={activeRecipient.id}
                  profilePic={activeRecipient.avatar}
                  onViewProfile={() => {
                    if (onViewProfile) {
                      onViewProfile(activeRecipient.id);
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 space-y-4">
              {messages.map((msg) => (
                <Message
                  key={msg.id}
                  sender={msg.sender.name}
                  profilePic={msg.sender.avatar}
                  content={msg.content}
                  timestamp={new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  receiving={msg.sender.id !== currentUserId}
                />
              ))}

              {isRecipientTyping && (
                <div className="flex items-center gap-2 text-secondaryText text-sm">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-secondaryText rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-secondaryText rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-secondaryText rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></span>
                  </div>
                  <span>{isRecipientTyping.name} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
            <div className="flex-shrink-0 px-6 mb-6">
              <LongTextArea
                placeholder="Send a Message"
                buttonText="Send"
                onSubmit={handleSendMessage}
                onChange={handleTyping}
                button
                minHeight="60px"
                maxHeight="150px"
                bgColor="bg-white"
                className="border border-stroke rounded-lg shadow-sm"
                disabled={!isConnected}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center gap-24 flex-col justify-center text-secondaryText">
            <div className="text-center">
              <p className="text-lg mb-2">Select a conversation</p>
              <p className="text-sm">
                Choose a conversation from the list to start messaging
              </p>
            </div>
            <img
              src="/EmptyMessages.png"
              alt="No messages"
              className="w-1/3 mb-4"
            />
          </div>
        )}
      </div>

      {allowNewConversations && (
        <UserSearchModal
          isOpen={showUserSearch}
          onClose={() => setShowUserSearch(false)}
          onSelectUser={handleUserSelected}
          currentUserId={currentUserId}
          currentUserRole={userRole}
        />
      )}
    </div>
  );
};

export default BaseMessages;
