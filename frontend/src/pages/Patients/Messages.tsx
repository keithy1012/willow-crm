import ConversationPreview from "components/card/MessagePreviewCard";
import ProfileHeaderCard from "components/card/ProfileHeaderCard";
import LongTextArea from "components/input/LongTextArea";
import SmallSearchBar from "components/input/SmallSearchBar";
import Message from "components/messages/Message";
import UserSearchModal from "components/input/UserSearch";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { NotePencil } from "phosphor-react";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { useRequireRole } from "hooks/useRequireRole";

interface ConversationGroup {
  label: string;
  conversations: any[];
}

const Messages: React.FC = () => {
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

  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useRequireRole("Patient");

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

    // Filter conversations based on search
    const filteredConversations = conversations.filter((conv) => {
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

    // Sort and group conversations
    filteredConversations.forEach((conv) => {
      const messageDate = new Date(conv.updatedAt);

      // Transform conversation for ConversationPreview component
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
        isOnline: otherParticipant
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
    conversations,
    searchQuery,
    activeConversation,
    onlineUsers,
    currentUserId,
  ]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle opening user search modal
  const handleNewConversation = () => {
    setShowUserSearch(true);
  };

  // Handle user selection from search modal
  const handleUserSelected = async (userId: string, user: any) => {
    console.log("Creating conversation with:", user.fullName || user.name);

    try {
      const newConversation = await createConversation(userId);

      if (newConversation) {
        selectConversation(newConversation.id);
        setShowUserSearch(false);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  // Handle sending message
  const handleSendMessage = (text: string) => {
    if (!text.trim() || !activeConversation) return;

    const recipient = activeConversation.participants.find(
      (p) => p.id !== currentUserId
    );
    if (!recipient) return;

    sendMessage(activeConversation.id, text, recipient.id);

    // Stop typing indicator
    if (isTyping) {
      handleStopTyping();
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!activeConversation || isTyping) return;

    const recipient = activeConversation.participants.find(
      (p) => p.id !== currentUserId
    );
    if (!recipient) return;

    setIsTyping(true);
    sendTypingIndicator(activeConversation.id, recipient.id, true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
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
  };

  // Get active conversation's other participant
  const activeRecipient = activeConversation?.participants.find(
    (p) => p.id !== currentUserId
  );
  const isRecipientTyping =
    activeConversation && typingUsers[activeConversation.id];

  return (
    <div className="w-full h-screen flex flex-row bg-foreground">
      {/* Sidebar */}
      <div className="w-1/3 p-6 space-y-3 h-screen border-r bg-background border-stroke flex flex-col">
        <div className="flex flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-xl">Messages</h2>
            {!isConnected && (
              <span className="text-xs text-error bg-error/10 px-2 py-1 rounded">
                Disconnected
              </span>
            )}
          </div>
          <NotePencil
            size={24}
            className="text-primaryText hover:text-primaryText/70 cursor-pointer transition-colors"
            onClick={handleNewConversation}
          />
        </div>

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
                <p className="text-sm font-semibold text-secondaryText">
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
            <div className="flex flex-col items-center justify-center h-full text-secondaryText">
              <p className="text-sm">No conversations yet</p>
              <button
                onClick={handleNewConversation}
                className="mt-2 text-primary hover:underline text-sm"
              >
                Start a new conversation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex w-2/3 flex-col">
        {activeConversation && activeRecipient ? (
          <>
            <div className="px-6 pt-6 mb-3 flex-shrink-0">
              <ProfileHeaderCard
                name={activeRecipient.name}
                username={activeRecipient.username}
                userId={activeRecipient.id}
              />
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
          <div className="flex-1 flex items-center justify-center text-secondaryText">
            <div className="text-center">
              <p className="text-lg mb-2">Select a conversation</p>
              <p className="text-sm">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* User Search Modal */}
      <UserSearchModal
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        onSelectUser={handleUserSelected}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default Messages;
