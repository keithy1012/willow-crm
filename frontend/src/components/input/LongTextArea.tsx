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
  minHeight?: string | number;
  maxHeight?: string | number;
  bgColor?: string;
}

const LongTextArea: React.FC<LongTextAreaProps> = ({
  placeholder,
  buttonText = "Send",
  onSubmit,
  button = false,
  className = "",
  value = "",
  onChange,
  minHeight = "50px",
  maxHeight = "200px",
  bgColor = "bg-foreground",
}) => {
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    if (onChange) onChange(newText);
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
      className={`border border-stroke rounded-lg shadow-sm p-4 ${bgColor} ${className}`}
    >
      <div className="flex flex-col gap-4">
        <textarea
          placeholder={placeholder}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyPress}
          className={`w-full bg-transparent resize-none outline-none text-primaryText placeholder-secondaryText text-base`}
          style={{ minHeight, maxHeight }}
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
