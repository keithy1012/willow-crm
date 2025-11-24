import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ChartBar, Bug, Question, SignOut } from "phosphor-react";
import UserProfileCard from "../card/UserProfileCard";
import SidebarItem from "./IconSidebar";

interface FinanceSidebarProps {}

const FinanceSidebar: React.FC<FinanceSidebarProps> = () => {
  const [activeItem, setActiveItem] = useState("Patient Invoices");
  const [isNavigating, setIsNavigating] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [userInitials, setUserInitials] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    // Pull user info from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);

      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      const initials = (user.firstName?.[0] || "") + (user.lastName?.[0] || "");

      setUserName(fullName || "Unknown User");
      setUsername(user.username || user.email || "unknown");
      setUserRole(user.role || "N/A");
      setUserInitials(initials.toUpperCase());
    }
  }, []);

  const menuItems = [
    { text: "Patient Invoices", icon: FileText, path: "/invoices" },
    {
      text: "Billing and Reports",
      icon: ChartBar,
      path: "/billing",
    },
  ];

  const bottomItems = [
    { text: "Bug Report", icon: Bug, path: "/finance-bug-report" },
    { text: "Help / Support", icon: Question, path: "/finance-help-support" },
    { text: "Logout", icon: SignOut, path: "/logout" },
  ];

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
          role={userRole}
        />
      </div>
    </div>
  );
};

export default FinanceSidebar;
