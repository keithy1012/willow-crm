import React, { useState } from "react";

interface FieldProps {
  placeholder: string;
}

const Field: React.FC<FieldProps> = ({ placeholder }) => {
  const [text, setText] = useState("");

  return (
    <div className="bg-foreground border border-stroke rounded-lg p-2">
      <textarea
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full min-h-[30px] max-h-[30px] bg-transparent resize-none outline-none text-primaryText placeholder-secondaryText text-base"
        rows={1}
      />
    </div>
  );
};

export default Field;
