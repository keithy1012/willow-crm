import React, { useState, useEffect } from "react";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  variant: "primary" | "outline";
  size: "small" | "medium" | "large";
  className?: string;
  selected?: boolean;
  controlled?: boolean;
  toggleable?: boolean;
  disabled?: boolean;
}

const PrimaryButton: React.FC<ButtonProps> = ({
  text,
  onClick,
  variant,
  size,
  className = "",
  selected = false,
  controlled = false,
  toggleable = true,
  disabled = false,
}) => {
  const [isSelected, setIsSelected] = useState(selected);

  useEffect(() => {
    if (controlled) {
      setIsSelected(selected);
    }
  }, [selected, controlled]);

  const handleClick = () => {
    if (disabled) return;

    if (!controlled && toggleable) {
      setIsSelected(!isSelected);
    }
    if (onClick) onClick();
  };

  const baseStyles =
    "inline-flex items-center justify-center shadow-md font-md rounded-lg transition-all duration-200 transform";

  const disabledStyles = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  const variants = {
    primary:
      "bg-primary border border-primary text-background " +
      (disabled ? "" : "hover:scale-105 hover:shadow-lg active:scale-100"),
    outline: (controlled ? selected : isSelected)
      ? "bg-primary border border-primary text-background " +
        (disabled ? "" : "hover:scale-105 hover:shadow-lg active:scale-100")
      : "border border-primary border-1 bg-background shadow-md text-primary " +
        (disabled
          ? ""
          : "hover:bg-primary hover:text-background hover:scale-105 hover:shadow-lg " +
            "active:scale-100 active:bg-primary active:text-background"),
  };

  const sizes = {
    small: "px-9 py-1.5 text-sm",
    medium: "px-10 py-2 text-base",
    large: "px-12 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      type="button"
    >
      {text}
    </button>
  );
};

export default PrimaryButton;
