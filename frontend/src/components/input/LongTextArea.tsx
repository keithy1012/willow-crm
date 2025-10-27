import React, { useState, useEffect } from "react";
import PrimaryButton from "../buttons/PrimaryButton";

interface LongTextAreaProps {
  placeholder: string;
  buttonText?: string;
  onSubmit?: (text: string) => void;
  button?: boolean;
  className?: string;
  value?: string;
  onChange?: (text: string) => void;
}

const LongTextArea: React.FC<LongTextAreaProps> = ({
  placeholder,
  buttonText = "Send",
  onSubmit,
  button = false,
  className = "",
  value = "",
  onChange,
}) => {
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    if (onChange) {
      onChange(newText);
    }
  };

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
    <div
      className={`bg-foreground border border-stroke rounded-lg shadow-sm p-4 ${className}`}
    >
      <div className="flex flex-col gap-4">
        <textarea
          placeholder={placeholder}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyPress}
          className="w-full min-h-[50px] max-h-[100px] bg-transparent resize-none outline-none text-primaryText placeholder-secondaryText text-base"
          rows={5}
        />
        {button && (
          <div className="flex justify-end">
            <PrimaryButton
              text={buttonText}
              variant="primary"
              size="small"
              onClick={handleSubmit}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LongTextArea;
