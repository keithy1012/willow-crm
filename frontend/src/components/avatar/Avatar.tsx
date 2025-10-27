import React from "react";

interface ProfileAvatarProps {
  imageUrl?: string;
  name?: string;
  size?: number;
  status?: "online" | "offline" | "busy";
}

const statusColors = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  busy: "bg-red-500",
};

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  imageUrl,
  name = "User",
  size = 40,
  status,
}) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="relative inline-block">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="rounded-full object-cover"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="rounded-full border text-darkerStroke border-stroke bg-background shadow-sm flex items-center justify-center font-semibold"
          style={{ width: size, height: size, fontSize: size / 4 }}
        >
          {initials}
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;
