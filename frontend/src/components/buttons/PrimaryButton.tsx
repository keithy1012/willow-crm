import { Button } from "react-native";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  variant: "primary" | "outline";
  size: "small" | "medium" | "large";
}
const PrimaryButton: React.FC<ButtonProps> = ({
  text,
  onClick,
  variant,
  size,
}) => {
  const baseStyles =
    "inline-flex items-center justify-center shadow-md font-md rounded-lg";

  const variants = {
    primary:
      "bg-primary text-background hover:bg-opacity-90 shadow-md",
    outline:
      "border-2 border-primary border-1 bg-background shadow-md text-primary hover:bg-primary hover:text-background",
  };

  const sizes = {
    small: "px-9 py-1.5 text-sm",
    medium: "px-10 py-2 text-base",
    large: "px-12 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default PrimaryButton;
