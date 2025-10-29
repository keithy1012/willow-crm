import React, { useState, useEffect, useRef } from "react";
import PrimaryButton from "../buttons/PrimaryButton";

interface LongTextAreaProps {
  placeholder: string;
  buttonText?: string;
  onSubmit?: (text: string) => void;
  onTyping?: () => void; // Added for typing indicator
  button?: boolean;
  className?: string;
  value?: string;
  onChange?: (text: string) => void;
  minHeight?: string | number;
  maxHeight?: string | number;
  bgColor?: string;
  disabled?: boolean; // Added for connection state
}

const LongTextArea: React.FC<LongTextAreaProps> = ({
  placeholder,
  buttonText = "Send",
  onSubmit,
  onTyping,
  button = false,
  className = "",
  value = "",
  onChange,
  minHeight = "50px",
  maxHeight = "200px",
  bgColor = "bg-foreground",
  disabled = false,
}) => {
  const [text, setText] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        typeof maxHeight === 'string' 
          ? parseInt(maxHeight) 
          : maxHeight
      )}px`;
    }
  }, [text, maxHeight]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    if (onChange) {
      onChange(newText);
    }
    
    // Trigger typing indicator
    if (onTyping && newText.length > 0) {
      onTyping();
    }
  };

  const handleSubmit = () => {
    if (text.trim() && onSubmit && !disabled) {
      onSubmit(text.trim());
      setText("");
      
      // Reset textarea height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      handleSubmit();
    }
    // Allow new line with Shift+Enter
    // Can also support Cmd/Ctrl+Enter if preferred
    else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={`border border-stroke rounded-lg shadow-sm p-4 ${bgColor} ${className} ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <div className="flex flex-col gap-4">
        <textarea
          ref={textareaRef}
          placeholder={disabled ? "Connection lost..." : placeholder}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyPress}
          disabled={disabled}
          className={`w-full bg-transparent resize-none outline-none text-primaryText placeholder-secondaryText text-base overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent`}
          style={{ 
            minHeight: typeof minHeight === 'string' ? minHeight : `${minHeight}px`,
            maxHeight: typeof maxHeight === 'string' ? maxHeight : `${maxHeight}px`
          }}
        />
        {button && (
          <div className="flex justify-end items-center gap-2">
            {text.length > 0 && (
              <span className="text-xs text-secondaryText">
                {text.length}/5000
              </span>
            )}
            <PrimaryButton
              text={buttonText}
              variant="primary"
              size="small"
              onClick={handleSubmit}
              disabled={disabled || !text.trim()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LongTextArea;