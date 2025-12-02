import React, { useState, useEffect } from "react";

interface ButtonProps {
  text: string;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void; // Changed this line
  variant: "primary" | "outline" | "secondary";
  size: "xs" | "small" | "medium" | "large";
  className?: string;
  selected?: boolean;
  controlled?: boolean;
  toggleable?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
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
  type = "button",
  icon,
  iconPosition = "left",
}) => {
  const [isSelected, setIsSelected] = useState(selected);

  useEffect(() => {
    if (controlled) {
      setIsSelected(selected);
    }
  }, [selected, controlled]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (!controlled && toggleable) {
      setIsSelected(!isSelected);
    }
    if (onClick) onClick(e);
  };

  const baseStyles =
    "inline-flex items-center justify-center shadow-sm font-md rounded-md transition-all duration-200 transform";

  const disabledStyles = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  const variants = {
    primary:
      "bg-primary border border-primary text-background " +
      (disabled ? "" : "hover:scale-103 hover:shadow-lg active:scale-100"),
    outline: (controlled ? selected : isSelected)
      ? "bg-primary border border-primary text-background " +
        (disabled ? "" : "hover:scale-103 hover:shadow-lg active:scale-100")
      : "border border-primary border-1 bg-background shadow-md text-primary " +
        (disabled
          ? ""
          : "hover:bg-primary hover:text-background hover:scale-103 hover:shadow-lg " +
            "active:scale-100 active:bg-primary active:text-background"),
    secondary:
      "bg-gray-200 border border-gray-300 text-gray-600 " +
      (disabled
        ? ""
        : "hover:bg-gray-300 hover:scale-103 hover:shadow-lg active:scale-100"),
  };

  const sizes = {
    xs: "px-6 py-1 text-xs",
    small: "px-9 py-1.5 text-sm",
    medium: "px-10 py-2 text-base",
    large: "px-12 py-3 text-lg",
  };

  // Adjust padding when icon is present
  const iconPadding = icon
    ? {
        xs: "px-4 py-1 text-xs",
        small: "px-6 py-1.5 text-sm",
        medium: "px-8 py-2 text-base",
        large: "px-10 py-3 text-lg",
      }
    : sizes;

  // Icon spacing based on size
  const iconSpacing = {
    xs: "gap-1",
    small: "gap-1.5",
    medium: "gap-2",
    large: "gap-2.5",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${iconPadding[size]} ${
        icon ? iconSpacing[size] : ""
      } ${disabledStyles} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      type={type}
    >
      {icon && iconPosition === "left" && (
        <span className="inline-flex items-center">{icon}</span>
      )}
      <span>{text}</span>
      {icon && iconPosition === "right" && (
        <span className="inline-flex items-center">{icon}</span>
      )}
    </button>
  );
};

export default PrimaryButton;
