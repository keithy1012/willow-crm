import React from "react";
import { IconProps } from "phosphor-react";

interface InfoItem {
  icon: React.ComponentType<IconProps>;
  text: string;
}

interface ProfileInfoProps {
  items: InfoItem[];
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ items }) => {
  return (
    <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm w-full">
      <ul className="space-y-2">
        {items.map(({ icon: Icon, text }, index) => (
          <li key={index} className="flex items-center space-x-3">
            <Icon className="w-5 h-5 text-gray-700" />
            <span className="text-gray-900 text-sm">{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfileInfo;
