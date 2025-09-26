import React, { useState } from "react";
import IconSidebar from "./IconSidebar.tsx";
import {
  House,
  ChatCircle,
  Calendar,
  FileText,
  Pill,
  Bug,
  Question,
} from "@phosphor-icons/react";

const PatientSidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState("Messages");

  const menuItems = [
    { text: "Dashboard", icon: House },
    { text: "Messages", icon: ChatCircle },
    { text: "Appointments", icon: Calendar },
    { text: "Medical Records", icon: FileText },
    { text: "Medications", icon: Pill },
  ];

  const bottomItems = [
    { text: "Bug Report", icon: Bug },
    { text: "Help / Support", icon: Question },
  ];

  return (
    <div className="w-80 h-screen bg-background border-r border-stroke flex flex-col">
      <div className="flex-1 p-4 space-y-3">
        {menuItems.map((item) => (
          <IconSidebar
            key={item.text}
            text={item.text}
            icon={item.icon}
            isActive={activeItem === item.text}
            onClick={() => setActiveItem(item.text)}
          />
        ))}
      </div>

      <div className="p-4 space-y-3 border-t border-stroke">
        {bottomItems.map((item) => (
          <IconSidebar
            key={item.text}
            text={item.text}
            icon={item.icon}
            isActive={activeItem === item.text}
            onClick={() => setActiveItem(item.text)}
          />
        ))}
      </div>
    </div>
  );
};

export default PatientSidebar;
