import React, { useState } from "react";
import PrimaryButton from "../buttons/PrimaryButton.tsx";

interface LongTextAreaProps {
  placeholder: string;
  buttonText: string;
  onSubmit?: (text: string) => void;
}

const LongTextArea: React.FC<LongTextAreaProps> = ({
  placeholder,
  buttonText,
  onSubmit,
}) => {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim() && onSubmit) {
      onSubmit(text);
      setText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="bg-foreground border border-stroke rounded-lg shadow-sm p-4">
      <div className="flex flex-col gap-4">
        <textarea
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full min-h-[50px] max-h-[50px] bg-transparent resize-none outline-none text-primaryText placeholder-secondaryText text-base"
          rows={5}
        />

        <div className="flex justify-end">
          <PrimaryButton text="Send" variant="primary" size="small" />
        </div>
      </div>
    </div>
  );
};

export default LongTextArea;
