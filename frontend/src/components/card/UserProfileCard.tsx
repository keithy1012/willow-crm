import React from "react";
import { useNavigate } from "react-router-dom";

interface UserProfileCardProps {
  name: string;
  username: string;
  initials?: string;
  role: string;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  name,
  username,
  initials,
  role,
}) => {
  const navigate = useNavigate();
  const handleClick = () => {
    switch (role) {
      case "Patient":
        navigate("/patient-profile");
        break;
      case "Ops":
        navigate("/ops-profile");
        break;
      case "IT":
        navigate("/it-profile");
        break;
      case "Finance":
        navigate("/finance-profile");
        break;
      case "Doctor":
        navigate("/doctor-profile");
        break;
      default:
        navigate("/error"); // fallback
    }
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  const displayInitials = initials || getInitials(name);

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      className={`flex items-center gap-3 bg-background p-3 rounded-lg shadow-sm border border-stroke cursor-pointer hover:bg-gray-50`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
    >
      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
        <span className="text-background font-medium text-sm">
          {displayInitials}
        </span>
      </div>
      <div>
        <div className="text-primaryText font-medium text-sm">{name}</div>
        <div className="text-secondaryText text-xs">
          {username.startsWith("@") ? username : `@${username}`}
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
