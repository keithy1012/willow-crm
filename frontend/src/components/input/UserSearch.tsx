import React, { useState, useEffect } from "react";
import SmallSearchBar from "./SmallSearchBar";
import { X } from "phosphor-react";
import { messageService } from "api/services/message.service";
import { UserSearchResult, UserRole } from "api/types/user.types";

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (userId: string, user: UserSearchResult) => void;
  currentUserId?: string;
}

const UserSearchModal: React.FC<UserSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  currentUserId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");

  // Debounced search
  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setSearchQuery("");
      setUsers([]);
      setError(null);
      setSelectedRole("");
      return;
    }

    if (searchQuery.length < 2) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedRole, isOpen]);

  const searchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;

      if (selectedRole) {
        response = await messageService.users.searchByRole(
          selectedRole,
          searchQuery
        );
      } else {
        response = await messageService.users.search(searchQuery);
      }

      // Filter out current user from results
      const filteredUsers = response.users.filter(
        (user) => user._id !== currentUserId
      );

      setUsers(filteredUsers);
    } catch (error) {
      console.error("Search failed:", error);
      setError("Failed to search users. Please try again.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setUsers([]);
    setError(null);
  };

  const handleSelectUser = (user: UserSearchResult) => {
    // Ensure fullName is set
    const userWithFullName = {
      ...user,
      fullName: user.fullName || `${user.firstName} ${user.lastName}`,
    };

    onSelectUser(user._id, userWithFullName);
    handleClose();
  };

  const handleClose = () => {
    handleClearSearch();
    setSelectedRole("");
    onClose();
  };

  const getUserInitials = (user: UserSearchResult): string => {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  const getRoleBadgeColor = (role: UserRole): string => {
    const colors: Record<UserRole, string> = {
      Doctor: "bg-blue-100 text-blue-800",
      Patient: "bg-green-100 text-green-800",
      Ops: "bg-purple-100 text-purple-800",
      IT: "bg-orange-100 text-orange-800",
      Finance: "bg-yellow-100 text-yellow-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg w-full max-w-md mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stroke">
          <h2 className="text-lg font-semibold text-primaryText">
            Start New Conversation
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-foreground rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-secondaryText" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole | "")}
            className="w-full px-3 py-2 bg-foreground border border-stroke rounded-lg text-primaryText focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            aria-label="Filter by role"
          >
            <option value="">All Users</option>
            <option value="Doctor">Doctors</option>
            <option value="Patient">Patients</option>
            <option value="Ops">Operations</option>
            <option value="IT">IT Staff</option>
            <option value="Finance">Finance</option>
          </select>

          <SmallSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, username, or email..."
            onClear={handleClearSearch}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-error px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-secondaryText mt-2">Searching...</p>
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
                  <div className="relative flex-shrink-0">
                    {user.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                        {getUserInitials(user)}
                      </div>
                    )}
                    {user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background"></div>
                    )}
                  </div>

                  <div className="flex-1 text-left">
                    <div className="font-medium text-primaryText">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-secondaryText flex items-center gap-2">
                      {user.username && <span>@{user.username}</span>}
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-stroke">
          <button
            onClick={handleClose}
            className="w-full py-2 bg-foreground hover:bg-stroke rounded-lg transition-colors text-primaryText font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;
