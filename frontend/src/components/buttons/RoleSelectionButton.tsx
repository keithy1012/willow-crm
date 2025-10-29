import React from "react";

interface RollSelectionButtonProps {
  text: string;
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline";
  size?: "medium" | "large";
}

const RollSelectionButton: React.FC<RollSelectionButtonProps> = ({
  text,
  icon,
  onClick,
  variant = "primary",
  size = "medium",
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-3 font-md rounded-lg transition-all duration-200 bg-white";

  const variants = {
    primary:
      "border-2 border-primary text-primary hover:bg-gray-300 shadow-md",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-300 shadow-sm",
  };

  const sizes = {
    medium: "px-12 py-3 text-md",
    large: "px-14 py-4 text-lg",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}
    >
      <span className="flex items-center">{icon}</span>
      <span>{text}</span>
    </button>
  );
};

export default RollSelectionButton;
