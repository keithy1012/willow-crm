// components/UserSearchModal.tsx
import React, { useState, useEffect, useCallback } from "react";
import SmallSearchBar from "./SmallSearchBar";
import { X } from "phosphor-react";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  profilePic?: string;
  isOnline: boolean;
}

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (userId: string, user: User) => void;
  currentUserId?: string;
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  currentUserId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");

  // Debounce timer
  useEffect(() => {
    if (searchQuery.length < 2) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedRole]);

  // In UserSearchModal.tsx or wherever you're calling the search
  const searchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("Sending search with token:", token ? "Yes" : "No");

      let url = `/api/users/search?query=${encodeURIComponent(searchQuery)}`;
      if (selectedRole) {
        url = `/api/users/search/role?role=${selectedRole}&query=${encodeURIComponent(
          searchQuery
        )}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Search response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        const error = await response.json();
        console.error("Search error:", error);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setUsers([]);
  };

  const handleSelectUser = (user: User) => {
    onSelectUser(user._id, user);
    onClose();
    handleClearSearch();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stroke">
          <h2 className="text-lg font-semibold text-primaryText">
            Start New Conversation
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-foreground rounded-lg transition-colors"
          >
            <X size={20} className="text-secondaryText" />
          </button>
        </div>

        {/* Search Section */}
        <div className="p-4 space-y-3">
          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 bg-foreground border border-stroke rounded-lg text-primaryText focus:outline-none"
          >
            <option value="">All Users</option>
            <option value="Doctor">Doctors</option>
            <option value="Patient">Patients</option>
            <option value="Ops">Operations</option>
            <option value="IT">IT Staff</option>
            <option value="Finance">Finance</option>
          </select>

          {/* Search Bar */}
          <SmallSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, username, or email..."
            onClear={handleClearSearch}
          />
        </div>

        {/* Results Section */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-secondaryText">
              Searching...
            </div>
          )}

          {!loading && searchQuery.length > 0 && searchQuery.length < 2 && (
            <div className="p-4 text-center text-secondaryText text-sm">
              Type at least 2 characters to search
            </div>
          )}

          {!loading && users.length === 0 && searchQuery.length >= 2 && (
            <div className="p-4 text-center text-secondaryText">
              No users found
            </div>
          )}

          {!loading && users.length > 0 && (
            <div className="py-2">
              {users.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full px-4 py-3 hover:bg-foreground transition-colors flex items-center gap-3 border-b border-stroke last:border-b-0"
                >
                  {/* Profile Picture */}
                  <div className="relative">
                    {user.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </div>
                    )}
                    {/* Online indicator */}
                    {user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 text-left">
                    <div className="font-medium text-primaryText">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-secondaryText">
                      @{user.username} • {user.role}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stroke">
          <button
            onClick={onClose}
            className="w-full py-2 bg-foreground hover:bg-stroke rounded-lg transition-colors text-primaryText"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;
