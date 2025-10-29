import React, { useState } from "react";

interface FieldProps {
  placeholder: string;
  value?: string;
  type?: string; 
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Field: React.FC<FieldProps> = ({ 
  placeholder, 
  value, 
  type = "text", 
  onChange 
}) => {
  const [text, setText] = useState("");
  const current = typeof value === "string" ? value : text;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    } else {
      setText(e.target.value);
    }
  };

  return (
    <div className="bg-foreground border border-stroke rounded-lg p-2">
      <input
        type={type}
        placeholder={placeholder}
        value={current}
        onChange={handleChange}
        className="w-full h-[30px] bg-transparent outline-none text-primaryText placeholder-secondaryText text-base"
      />
    </div>
  );
};

export default Field;