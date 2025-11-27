import React from "react";

interface ChatMessageProps {
  sender: "user" | "bot";
  text: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ sender, text }) => {
  const isUser = sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[75%] px-4 py-2 rounded-2xl text-sm
          ${
            isUser
              ? "bg-primary text-white rounded-br-none"
              : "bg-gray-100 text-gray-800 rounded-bl-none"
          }
        `}
      >
        {text}
      </div>
    </div>
  );
};

export default ChatMessage;
