import ProfileAvatar from "components/avatar/Avatar";
import PrimaryButton from "components/buttons/PrimaryButton";
import React from "react";

interface ProfileHeaderCardProps {
  name: string;
  username: string;
  profilePic?: string;
  userId: string;
}

const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
  name,
  username,
  profilePic,
  userId,
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

      <PrimaryButton text="View Profile" variant="primary" size="small" />
    </div>
  );
};

export default ProfileHeaderCard;
