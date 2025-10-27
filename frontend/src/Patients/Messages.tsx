import ConversationPreview from "components/card/MessagePreviewCard";
import ProfileHeaderCard from "components/card/ProfileHeaderCard";
import LongTextArea from "components/input/LongTextArea";
import SmallSearchBar from "components/input/SmallSearchBar";
import Message from "components/messages/Message";
import React, { useState, useRef, useEffect } from "react";
import { NotePencil } from "phosphor-react";

interface ChatMessage {
  sender: string;
  content: string;
  timestamp: string;
  receiving: boolean;
}

interface Conversation {
  id: string;
  user: {
    name: string;
    username: string;
    avatar?: string;
  };
  lastMessage: string;
  timestamp: string;
  hasUnread?: boolean;
  isActive?: boolean;
}

interface ConversationGroup {
  label: string;
  conversations: Conversation[];
}

const Messages: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const conversationGroups: ConversationGroup[] = [
    {
      label: "Today",
      conversations: [
        {
          id: "1",
          user: {
            name: "Dr. Sarah Wilson",
            username: "drsarahwilson",
            avatar: undefined,
          },
          lastMessage:
            "Thank you for the update on the patient's progress. I'll review the charts and get back to you shortly.",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
          isActive: true,
        },
        {
          id: "2",
          user: {
            name: "Dr. Michael Chen",
            username: "drmchen",
            avatar: undefined,
          },
          lastMessage:
            "The lab results are in. Can we discuss them during tomorrow's morning rounds?",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          hasUnread: true,
        },
        {
          id: "3",
          user: {
            name: "Dr. Emily Rodriguez",
            username: "dr.erodriguez",
            avatar: undefined,
          },
          lastMessage:
            "I've scheduled the consultation for next week. Please confirm your availability.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
          hasUnread: true,
        },
      ],
    },
    {
      label: "Last Week",
      conversations: [
        {
          id: "4",
          user: {
            name: "Dr. James Patterson",
            username: "jpatterson_md",
            avatar: undefined,
          },
          lastMessage:
            "The surgery went well. Patient is recovering in ICU. Will send detailed notes.",
          timestamp: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 3
          ).toISOString(), // 3 days ago
        },
        {
          id: "5",
          user: {
            name: "Dr. Lisa Thompson",
            username: "lthompson",
            avatar: undefined,
          },
          lastMessage:
            "Can you review the treatment plan for patient in room 302? Thanks!",
          timestamp: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 5
          ).toISOString(), // 5 days ago
          hasUnread: true,
        },
        {
          id: "6",
          user: {
            name: "Dr. Robert Kim",
            username: "dr.rkim",
            avatar: undefined,
          },
          lastMessage:
            "The radiology report shows significant improvement. Great work on the treatment approach.",
          timestamp: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 6
          ).toISOString(), // 6 days ago
        },
      ],
    },
  ];

  // Fake message data
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "Dr. Sarah Wilson",
      content:
        "Hi! I wanted to discuss the patient case we reviewed yesterday. Do you have a few minutes?",
      timestamp: "2:45 PM",
      receiving: true,
    },
    {
      sender: "Me",
      content:
        "Of course! I've been reviewing the test results. The patient's condition seems to be improving steadily.",
      timestamp: "2:47 PM",
      receiving: false,
    },
    {
      sender: "Dr. Sarah Wilson",
      content:
        "That's great to hear. I noticed the white blood cell count has normalized. Should we adjust the medication dosage?",
      timestamp: "2:50 PM",
      receiving: true,
    },
    {
      sender: "Me",
      content:
        "I think we should maintain the current dosage for another 48 hours and then reassess. What do you think?",
      timestamp: "2:52 PM",
      receiving: false,
    },
    {
      sender: "Dr. Sarah Wilson",
      content:
        "Agreed. Let's schedule a follow-up consultation for Thursday morning. I'll coordinate with the nursing staff.",
      timestamp: "2:55 PM",
      receiving: true,
    },
    {
      sender: "Me",
      content:
        "Perfect. I'll update the patient's chart and notify the family about the progress.",
      timestamp: "2:58 PM",
      receiving: false,
    },
    {
      sender: "Dr. Sarah Wilson",
      content:
        "Thank you! Also, could you send me the latest lab reports when you get a chance?",
      timestamp: "3:00 PM",
      receiving: true,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const newMessage: ChatMessage = {
      sender: "Me",
      content: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      receiving: false,
    };

    setMessages([...messages, newMessage]);
  };

  const handleSearchClear = () => {
    setSearchQuery("");
  };

  const handleConversationClick = (conversationId: string) => {
    console.log("Selected conversation:", conversationId);
    // Handle conversation selection
  };

  return (
    <div className="w-full h-screen flex flex-row bg-foreground">
      <div className="w-1/3 p-6 space-y-3 h-screen border-r bg-background border-stroke flex flex-col">
        <div className="flex flex-row justify-between">
          <h2 className="text-xl">Messages</h2>
          <NotePencil
            size={24}
            className="text-primaryText hover:text-primaryText/70 cursor-pointer transition-colors"
          />
        </div>

        <SmallSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={handleSearchClear}
          placeholder="Search conversations..."
        />

        <div className="flex-1 overflow-y-auto space-y-3">
          {conversationGroups.map((group) => (
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
          ))}
        </div>
      </div>

      <div className="flex w-2/3 flex-col">
        <div className="px-6 pt-6 mb-3 flex-shrink-0">
          <ProfileHeaderCard
            name="Dr. Sarah Wilson"
            username="drsarahwilson"
            userId="user-123"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-4">
          {messages.map((msg, idx) => (
            <Message
              key={idx}
              sender={msg.sender}
              content={msg.content}
              timestamp={msg.timestamp}
              receiving={msg.receiving}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex-shrink-0 px-6 mb-6">
          <LongTextArea
            placeholder="Send a Message"
            buttonText="Send"
            onSubmit={handleSendMessage}
            button
            minHeight="60px"
            maxHeight="150px"
            bgColor="bg-white"
            className="border border-stroke rounded-lg shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default Messages;
