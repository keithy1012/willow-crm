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

const Messages: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "Dr. Lok Ye Young",
      content:
        "This is my message that I want to shareThis is my message that I want to shareThis is my message that I want to share",
      timestamp: "3:15 PM",
      receiving: true,
    },
    {
      sender: "Dr. Lok Ye Young",
      content:
        "This is my message that I want to shareThis is my message that I want to shareThis is my message that I want to share",
      timestamp: "3:15 PM",
      receiving: true,
    },
    {
      sender: "Me",
      content:
        "This is my message that I want to shareThis is my message that I want to shareThis is my message that I want to share",
      timestamp: "3:15 PM",
      receiving: false,
    },
    {
      sender: "Me",
      content:
        "This is my message that I want to shareThis is my message that I want to shareThis is my message that I want to share",
      timestamp: "3:15 PM",
      receiving: false,
    },
    {
      sender: "Dr. Lok Ye Young",
      content:
        "This is my message that I want to shareThis is my message that I want to shareThis is my message that I want to share",
      timestamp: "3:15 PM",
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
          value={""}
          onChange={function (text: string): void {}}
          onClear={function (): void {}}
        ></SmallSearchBar>
        <p>Today</p>
        <ConversationPreview
          user={{
            name: "Lok Ye Young",
            username: "lokyeyoung",
            avatar: undefined,
          }}
          lastMessage={
            "This is my last message i really hope it worksThis is my last message i really hope it worksThis is my last message i really hope it works"
          }
          timestamp={"2025-10-13T19:13:03.306+00:00"}
          isActive={true}
        ></ConversationPreview>
        <ConversationPreview
          user={{
            name: "Lok Ye Young",
            username: "lokyeyoung",
            avatar: undefined,
          }}
          lastMessage={
            "This is my last message i really hope it worksThis is my last message i really hope it worksThis is my last message i really hope it works"
          }
          timestamp={"2025-10-13T19:13:03.306+00:00"}
          hasUnread={true}
        ></ConversationPreview>
        <ConversationPreview
          user={{
            name: "Lok Ye Young",
            username: "lokyeyoung",
            avatar: undefined,
          }}
          lastMessage={
            "This is my last message i really hope it worksThis is my last message i really hope it worksThis is my last message i really hope it works"
          }
          timestamp={"2025-10-13T19:13:03.306+00:00"}
          hasUnread={true}
        ></ConversationPreview>
        <p>Last Week</p>
        <ConversationPreview
          user={{
            name: "Lok Ye Young",
            username: "lokyeyoung",
            avatar: undefined,
          }}
          lastMessage={
            "This is my last message i really hope it worksThis is my last message i really hope it worksThis is my last message i really hope it works"
          }
          timestamp={"2025-10-13T19:13:03.306+00:00"}
          hasUnread={true}
        ></ConversationPreview>
        <ConversationPreview
          user={{
            name: "Lok Ye Young",
            username: "lokyeyoung",
            avatar: undefined,
          }}
          lastMessage={
            "This is my last message i really hope it worksThis is my last message i really hope it worksThis is my last message i really hope it works"
          }
          timestamp={"2025-10-13T19:13:03.306+00:00"}
          hasUnread={true}
        ></ConversationPreview>
        <ConversationPreview
          user={{
            name: "Lok Ye Young",
            username: "lokyeyoung",
            avatar: undefined,
          }}
          lastMessage={
            "This is my last message i really hope it worksThis is my last message i really hope it worksThis is my last message i really hope it works"
          }
          timestamp={"2025-10-13T19:13:03.306+00:00"}
          hasUnread={true}
        ></ConversationPreview>
      </div>
      <div className="flex w-2/3 flex-col">
        <div className="px-6 pt-6 mb-3 flex-shrink-0">
          <ProfileHeaderCard
            name={"Lok Ye Young"}
            username={"lokyeyoung"}
            userId={"asdasdkfjalsjfd"}
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

        <div className="flex-shrink-0 px-6 mb-6 ">
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
