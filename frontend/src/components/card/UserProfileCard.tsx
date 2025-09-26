import React from "react";

interface UserProfileCardProps {
  name: string;
  username: string;
  initials?: string;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  name,
  username,
  initials,
}) => {
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  const displayInitials = initials || getInitials(name);

  return (
    <div className="flex items-center gap-3 bg-background p-3 rounded-lg shadow-sm border border-stroke">
      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
        <span className="text-background font-medium text-sm">
          {displayInitials}
        </span>
      </div>
      <div>
        <div className="text-primaryText font-medium text-sm">
          {name}
        </div>
        <div className="text-secondaryText text-xs">
          {username.startsWith('@') ? username : `@${username}`}
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;