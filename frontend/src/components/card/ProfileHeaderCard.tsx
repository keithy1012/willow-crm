import ProfileAvatar from "components/avatar/Avatar";
import PrimaryButton from "components/buttons/PrimaryButton";
import React from "react";

interface ProfileHeaderCardProps {
  name: string;
  username: string;
  profilePic?: string;
  userId: string;
  message?: boolean;
  onMessage?: () => void;
  onViewProfile?: () => void;
}

const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
  name,
  username,
  profilePic,
  userId,
  message,
  onMessage,
  onViewProfile,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-stroke">
      <div className="flex items-center space-x-3">
        <ProfileAvatar imageUrl={profilePic} name={name} size={48} />
        <div className="flex flex-col justify-center">
          <h2 className="text-md text-primaryText">{name}</h2>
          <p className="text-xs text-secondaryText">@{username}</p>
        </div>
      </div>
      <div className="space-x-4">
        <PrimaryButton
          onClick={onViewProfile}
          text="View Profile"
          variant={message ? "outline" : "primary"}
          size="small"
        />
        {message && (
          <PrimaryButton
            onClick={onMessage}
            text="Message"
            variant="primary"
            size="small"
          />
        )}
      </div>
    </div>
  );
};

export default ProfileHeaderCard;
