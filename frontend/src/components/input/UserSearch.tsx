import React, { useState, useEffect } from "react";
import { X } from "phosphor-react";
import { userService } from "api/services/user.service";
import { UserSearchResult } from "api/types/user.types";
import ProfileAvatar from "components/avatar/Avatar";
import PrimaryButton from "components/buttons/PrimaryButton";
import SmallSearchBar from "components/input/SmallSearchBar";

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (userId: string, user: UserSearchResult) => void;
  currentUserId: string;
  currentUserRole: "Doctor" | "Patient" | "Ops" | "IT" | "Finance";
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  currentUserId,
  currentUserRole,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "all" | "doctors" | "patients"
  >("all");

  const getMessageableRoles = (): string[] => {
    switch (currentUserRole) {
      case "Patient":
        return ["Doctor"];
      case "Doctor":
        return ["Doctor", "Patient"];
      default:
        return [];
    }
  };

  const messageableRoles = getMessageableRoles();

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await userService.search(searchQuery);
        const filteredResults = response.users.filter(
          (user) =>
            user._id !== currentUserId && messageableRoles.includes(user.role)
        );

        let tabFilteredResults = filteredResults;
        if (currentUserRole === "Doctor" && selectedTab !== "all") {
          tabFilteredResults = filteredResults.filter((user) => {
            if (selectedTab === "doctors") return user.role === "Doctor";
            if (selectedTab === "patients") return user.role === "Patient";
            return true;
          });
        }

        setSearchResults(tabFilteredResults);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, isOpen, currentUserId, selectedTab, currentUserRole]);

  if (!isOpen) return null;

  const handleUserClick = (user: UserSearchResult) => {
    onSelectUser(user._id, user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative">
        <div className="flex items-center justify-between p-5 border-b border-stroke">
          <h2 className="text-lg font-semibold text-primaryText">
            Start Message
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-foreground rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-secondaryText" />
          </button>
        </div>
        <div className="p-4 border-b border-stroke">
          <SmallSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            placeholder={
              currentUserRole === "Patient"
                ? "Search for doctors..."
                : "Search for users..."
            }
          />
          {currentUserRole === "Doctor" && (
            <div className="flex gap-2 mt-3">
              <PrimaryButton
                text="All"
                onClick={() => setSelectedTab("all")}
                variant="outline"
                size="small"
                controlled={true}
                selected={selectedTab === "all"}
                toggleable={false}
                className="w-[20px]"
              />
              <PrimaryButton
                text="Doctors"
                onClick={() => setSelectedTab("doctors")}
                variant="outline"
                size="small"
                controlled={true}
                selected={selectedTab === "doctors"}
                toggleable={false}
                className="w-[20px]"
              />
              <PrimaryButton
                text="Patients"
                onClick={() => setSelectedTab("patients")}
                variant="outline"
                size="small"
                controlled={true}
                selected={selectedTab === "patients"}
                toggleable={false}
                className="w-[20px]"
              />
            </div>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : searchQuery.length < 2 ? (
            <div className="py-8 px-4 text-center text-secondaryText">
              <p className="text-sm">
                {currentUserRole === "Patient"
                  ? "Search for doctors by name"
                  : "Search for users by name"}
              </p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-5">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="px-4 py-3 hover:bg-foreground transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <ProfileAvatar
                      imageUrl={user.profilePic}
                      name={
                        user.fullName || `${user.firstName} ${user.lastName}`
                      }
                      size={40}
                    />
                    <div>
                      <p className="text-sm font-medium text-primaryText">
                        {user.fullName || `${user.firstName} ${user.lastName}`}
                      </p>
                      <p className="text-xs text-secondaryText">
                        @{user.username}
                        {user.role && (
                          <span className="ml-2 px-1.5 py-0.5 bg-foreground text-secondaryText rounded text-xs">
                            {user.role}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <PrimaryButton
                      text="Message"
                      onClick={() => {
                        handleUserClick(user);
                      }}
                      variant="primary"
                      size="small"
                      toggleable={false}
                      className="w-[30px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 px-4 text-center text-secondaryText">
              <p className="text-sm">No users found</p>
              {currentUserRole === "Patient" && (
                <p className="text-xs mt-1">Only doctors can be messaged</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;
