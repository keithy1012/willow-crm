import React, { useState } from "react";

interface FieldProps {
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const Field: React.FC<FieldProps> = ({ placeholder, value, onChange }) => {
  const [text, setText] = useState("");
  const current = typeof value === "string" ? value : text;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e);
    } else {
      setText(e.target.value);
    }
  };

  return (
    <div className="bg-foreground border border-stroke rounded-lg p-2">
      <textarea
        placeholder={placeholder}
        value={current}
        onChange={handleChange}
        className="w-full min-h-[30px] max-h-[30px] bg-transparent resize-none outline-none text-primaryText placeholder-secondaryText text-base"
        rows={1}
      />
    </div>
  );
};

export default Field;
