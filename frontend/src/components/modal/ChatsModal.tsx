import React from "react";
import PrimaryButton from "../buttons/PrimaryButton";
import ChatMessage from "components/messages/ChatBotMessage";

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
  onSend: () => void;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">AI Chat</h3>
          <button
            className="text-sm text-gray-600 hover:text-gray-800"
            onClick={onClose}
          >
            x
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-3 mb-4">
          {chatMessages.length === 0 && !isBotTyping && (
            <div className="text-sm text-gray-500">
              Hello! I'm Willow AI, your virtual healthcare chatbot. I can
              provide safe, helpful medical information and guidance, but I am
              not a substitute for a real medical professional. I cannot
              diagnose medical conditions. How can I assist you today?
            </div>
          )}

          {chatMessages.map((msg, i) => (
            <ChatMessage key={i} sender={msg.sender} text={msg.text} />
          ))}

          {isBotTyping && (
            <div className="text-sm italic text-gray-600">Thinking...</div>
          )}
        </div>

        <div className="flex gap-3">
          <textarea
            className="flex-1 border rounded-lg p-2"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type your question..."
            rows={2}
          />

          <PrimaryButton
            text={isBotTyping ? "Sending..." : "Send"}
            variant="primary"
            size="small"
            onClick={onSend}
            disabled={isBotTyping}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
