import React from "react";

interface BookingButtonProps {
  time: string;
  isBooked?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
}

const BookingButton: React.FC<BookingButtonProps> = ({
  time,
  isBooked = false,
  onClick,
  disabled = false,
  size = "medium",
}) => {
  const sizeClasses = {
    small: "px-3 py-1.5 text-xs",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isBooked}
      className={`
        ${sizeClasses[size]}
        rounded-lg
        border
        shadow-sm
        font-medium
        transition-all
        duration-200
        ${
          isBooked || disabled
            ? "border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed"
            : "border-success text-[#5B7FA6] hover:bg-success hover:text-white active:scale-95"
        }
      `}
    >
      {isBooked ? "Booked" : `Book ${time}`}
    </button>
  );
};

export default BookingButton;
