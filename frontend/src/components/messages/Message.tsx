import ProfileAvatar from "components/avatar/Avatar";
import React from "react";

interface MessageProps {
  sender: string;
  profilePic?: string;
  content: string;
  timestamp: string;
  receiving: boolean;
}

const Message: React.FC<MessageProps> = ({
  sender,
  profilePic,
  content,
  timestamp,
  receiving,
}) => {
  return (
    <div
      className={`flex w-full my-2 ${
        receiving ? "flex-row" : "flex-row-reverse"
      } items-start gap-3`}
    >
      <ProfileAvatar
        imageUrl={profilePic}
        name={sender}
        size={48}
        status="online"
      />

      <div className="flex flex-col space-y-1 max-w-xs md:max-w-sm">
        <div className="flex flex-row justify-between">
          <span className="text-md font-small text-primaryText">{sender}</span>

          <span
            className={`text-sm justify-center align-text-bottom ${
              receiving
                ? "text-secondaryText text-right"
                : "text-secondaryText text-right"
            }`}
          >
            {timestamp}
          </span>
        </div>

        <p
          className={`p-4 rounded-lg border shadow-sm text-sm break-words ${
            receiving
              ? "bg-white border-stroke text-primaryText text-left"
              : "bg-primary text-white text-right border-transparent"
          }`}
        >
          {content}
        </p>
      </div>
    </div>
  );
};

export default Message;
