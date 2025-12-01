import ProfileAvatar from "components/avatar/Avatar";
import PrimaryButton from "components/buttons/PrimaryButton";
import React from "react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const handleViewProfile = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    if (onViewProfile) {
      onViewProfile();
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  const handleMessage = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    if (onMessage) {
      onMessage();
    } else {
      navigate(`/messages?userId=${userId}`);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-stroke">
      <div className="flex items-center space-x-3">
        <ProfileAvatar imageUrl={profilePic} name={name} size={48} />
        <div className="flex flex-col justify-center">
          <h2 className="text-md text-primaryText">{name}</h2>
          <p className="text-xs text-secondaryText">@{username}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <PrimaryButton
          onClick={(e) => {
            e?.stopPropagation();
            handleViewProfile(e);
          }}
          text="View Profile"
          variant={message ? "outline" : "primary"}
          size="xs"
        />
        {message && (
          <PrimaryButton
            onClick={(e) => {
              e?.stopPropagation();
              handleMessage(e);
            }}
            text="Message"
            variant="primary"
            size="xs"
          />
        )}
      </div>
    </div>
  );
};

export default ProfileHeaderCard;
