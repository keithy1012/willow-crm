import React, { useState } from "react";

interface SidebarItemProps {
  text: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  isActive?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  text,
  icon: IconComponent,
  isActive = false,
  onClick,
}) => {
  const [isClicked, setIsClicked] = useState(isActive);

  const handleClick = () => {
    setIsClicked(!isClicked);
    onClick?.();
  };

  return (
    <div
      className={`
        relative rounded-lg w-full h-10 flex items-center gap-3
        text-left text-base text-black cursor-pointer transition-all duration-200 px-2 py-2
        ${
          isClicked
            ? "shadow-sm bg-foreground border border-stroke"
            : "bg-transparent hover:bg-foreground hover:border hover:border-stroke hover:shadow-sm"
        }
      `}
      onClick={handleClick}
    >
      <div className="w-4 h-5 relative flex items-center justify-center">
        {IconComponent ? (
          <IconComponent
            size={16}
            className={isClicked ? "text-primary" : "text-primaryText"}
          />
        ) : (
          <div
            className={`w-4 h-4 rounded ${
              isClicked ? "bg-primary" : "bg-primaryText"
            }`}
            style={{
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center",
            }}
          />
        )}
      </div>
      <span className="relative select-none">{text}</span>
    </div>
  );
};

export default SidebarItem;
