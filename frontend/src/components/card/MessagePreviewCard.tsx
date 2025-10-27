import React from "react";
import ProfileAvatar from "components/avatar/Avatar";

interface ConversationPreviewProps {
  user: {
    name: string;
    username: string;
    avatar?: string;
  };
  lastMessage: string;
  timestamp: string;
  isActive?: boolean;
  hasUnread?: boolean;
  onClick?: () => void;
}

const ConversationPreview: React.FC<ConversationPreviewProps> = ({
  user,
  lastMessage,
  timestamp,
  isActive = false,
  hasUnread = false,
  onClick,
}) => {
  const formatTimestamp = (date: string | number | Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    if (messageDate.getFullYear() !== now.getFullYear()) {
      options.year = "numeric";
    }
    return messageDate.toLocaleDateString("en-US", options);
  };

  // Truncate message for preview
  const truncateMessage = (text: string, maxLength = 80) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  return (
    <div
      onClick={onClick}
      className={`
        flex items-start p-3 cursor-pointer transition-all
        hover:bg-gray-50 rounded-lg
        ${isActive ? "bg-foreground border border-stroke" : "bg-white"}
      `}
    >
      <div className="flex-shrink-0 mr-3">
        <ProfileAvatar imageUrl={user.avatar} name={user.name} size={48} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h4 className="text-sm text-primaryText">{user.name}</h4>
            <p className="text-xs text-secondaryText">@{user.username}</p>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-secondaryText">
              {formatTimestamp(timestamp)}
            </span>
            {hasUnread && (
              <span className="ml-2 w-1.5 h-1.5 bg-error rounded-full"></span>
            )}
          </div>
        </div>

        <p className="text-xs mt-2 text-primaryText mt-1">
          {truncateMessage(lastMessage)}
        </p>
      </div>
    </div>
  );
};

export default ConversationPreview;
