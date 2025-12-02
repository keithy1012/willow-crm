import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import IconSidebar from "./IconSidebar";
import {
  House,
  ChatCircle,
  Bug,
  Question,
  Calendar,
  SignOut,
  IdentificationBadge,
} from "phosphor-react";

import UserProfileCard from "../card/UserProfileCard";
import SidebarItem from "./IconSidebar";

interface DoctorSidebarProps {
  userName?: string;
  username?: string;
  userInitials?: string;
}

const DoctorSidebar: React.FC<DoctorSidebarProps> = ({}) => {
  const [activeItem, setActiveItem] = useState("Messages");
  const [isNavigating, setIsNavigating] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [userInitials, setUserInitials] = useState<string>("");

  useEffect(() => {
    // Pull user info from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);

      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      const initials = (user.firstName?.[0] || "") + (user.lastName?.[0] || "");

      setUserName(fullName || "Unknown User");
      setUsername(user.username || user.email || "unknown");
      setUserInitials(initials.toUpperCase());
    }
  }, []);

  const menuItems = [
    { text: "Dashboard", icon: House, path: "/doctordashboard" },
    { text: "Messages", icon: ChatCircle, path: "/doctormessages" },
    {
      text: "My Patients",
      icon: IdentificationBadge,
      path: "/doctorpatients",
    },
    { text: "My Appointments", icon: Calendar, path: "/doctorappointments" },
  ];

  const bottomItems = [
    { text: "Bug Report", icon: Bug, path: "/doctor-bug-report" },
    { text: "Logout", icon: SignOut, path: "/logout" },
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
          name={`Dr. ${userName}`}
          username={username}
          initials={userInitials}
          role={"Doctor"}
        />
      </div>
    </div>
  );
};

export default DoctorSidebar;
