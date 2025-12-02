import React from "react";
import PrimaryButton from "../buttons/PrimaryButton";
import ChatMessage from "components/messages/ChatBotMessage";
import LongTextArea from "components/input/LongTextArea";
import { X } from "phosphor-react";

type ChatMessageType = {
  sender: "user" | "bot";
  text: string;
};

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatMessages: ChatMessageType[];
  chatInput: string;
  setChatInput: (value: string) => void;
  onSend: (text?: string) => void;
  isBotTyping: boolean;
}

const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  chatMessages,
  chatInput,
  setChatInput,
  onSend,
  isBotTyping,
}) => {
  if (!isOpen) return null;

  const handleSubmit = (text: string) => {
    if (!text.trim() || isBotTyping) return;
    onSend(text);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-primaryText">
            Your Willow AI Assistant
          </h3>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onClose}
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        {/* Welcome Message */}
        <div className="bg-foreground border-l-4 border-primary px-6 py-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            Hello! I'm Willow AI, your virtual healthcare chatbot. I can provide
            safe, helpful medical information and guidance, but I am not a
            substitute for a real medical professional. I cannot diagnose
            medical conditions. How can I assist you today?
          </p>
          <p className="mt-2 text-sm text-gray-700">
            How can I assist you today?
          </p>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-background">
          {chatMessages.length === 0 && !isBotTyping && (
            <div className="text-center text-sm text-gray-500 py-8">
              Start a conversation by typing a question below
            </div>
          )}

          {chatMessages.map((msg, i) => (
            <ChatMessage key={i} sender={msg.sender} text={msg.text} />
          ))}

          {isBotTyping && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-semibold text-sm">AI</span>
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm max-w-[75%]">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <LongTextArea
            placeholder="Type your question here..."
            buttonText={isBotTyping ? "Sending..." : "Send"}
            onSubmit={handleSubmit}
            button={true}
            disabled={isBotTyping}
            minHeight="60px"
            maxHeight="120px"
            bgColor="bg-white"
            className="border border-gray-300 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
