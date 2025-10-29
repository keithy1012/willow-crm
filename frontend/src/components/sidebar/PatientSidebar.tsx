import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import IconSidebar from "./IconSidebar";
import {
  House,
  ChatCircle,
  FileText,
  Pill,
  Bug,
  Question,
  Calendar,
} from "phosphor-react";

import UserProfileCard from "../card/UserProfileCard";
import SidebarItem from "./IconSidebar";

interface PatientSidebarProps {
  userName?: string;
  username?: string;
  userInitials?: string;
}

const PatientSidebar: React.FC<PatientSidebarProps> = ({
  userName = "Lok Ye Young",
  username = "lokyeyoung",
  userInitials,
}) => {
  const [activeItem, setActiveItem] = useState("Messages");
  const [isNavigating, setIsNavigating] = useState(false);

  const menuItems = [
    { text: "Dashboard", icon: House, path: "/patientdashboard" },
    { text: "Messages", icon: ChatCircle, path: "/messages" },
    { text: "Appointments", icon: Calendar, path: "/appointments" },
    { text: "Medical Records", icon: FileText, path: "/medical-records" },
    { text: "Medications", icon: Pill, path: "/medications" },
  ];

  const bottomItems = [
    { text: "Bug Report", icon: Bug, path: "/bug-report" },
    { text: "Help / Support", icon: Question, path: "/help-support" },
  ];

  const navigate = useNavigate();

  const handleItemClick = (text: string, path: string) => {
    if (isNavigating) return;

    setIsNavigating(true);
    setActiveItem(text);
    navigate(path);

    setTimeout(() => setIsNavigating(false), 300);
  };

  return (
    <div className="w-56 h-screen bg-background border-r border-stroke flex flex-col">
      <div className="flex-1 p-4 space-y-3">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.text}
            text={item.text}
            icon={item.icon}
            isActive={activeItem === item.text}
            onClick={() => handleItemClick(item.text, item.path)}
          />
        ))}
      </div>

      <div className="p-4 space-y-3 border-t border-stroke">
        {bottomItems.map((item) => (
          <SidebarItem
            key={item.text}
            text={item.text}
            icon={item.icon}
            isActive={activeItem === item.text}
            onClick={() => handleItemClick(item.text, item.path)}
          />
        ))}

        <UserProfileCard
          name={userName}
          username={username}
          initials={userInitials}
        />
      </div>
    </div>
  );
};

export default PatientSidebar;
