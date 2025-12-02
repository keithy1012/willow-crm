import React, { useState } from "react";

interface Message {
  sender: "user" | "bot";
  text: string;
}

interface ChatBoxProps {
  messages: Message[];
  onSubmit: (val: string) => void;
  isBotTyping?: boolean;
}

export default function ChatBox({
  onSubmit,
  messages,
  isBotTyping,
}: ChatBoxProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    onSubmit(trimmed);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable message area */}
      <div className="p-3 space-y-3 overflow-y-auto min-h-[120px] max-h-[450px] border-b">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg max-w-[75%] ${
              msg.sender === "user"
                ? "ml-auto bg-primary text-white"
                : "mr-auto bg-gray-200 text-gray-800"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {isBotTyping && (
          <div className="mr-auto bg-gray-200 text-gray-600 p-3 rounded-lg max-w-[75%] italic">
            Thinking...
          </div>
        )}
      </div>

      {/* Input area */}

      <form onSubmit={handleSubmit} className="p-3 flex gap-2">
        <textarea
          className="flex-1 border rounded-lg p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
        />
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </form>
    </div>
  );
}
