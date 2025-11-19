import React from "react";
import { Phone, EnvelopeSimple, User, Calendar } from "phosphor-react";
import { useRequireRole } from "hooks/useRequireRole";
import { useAuth } from "contexts/AuthContext";

const ITProfile: React.FC = () => {
  useRequireRole("IT");
  const { user: authUser } = useAuth();

  const initials = `${authUser?.firstName?.[0] ?? ""}${
    authUser?.lastName?.[0] ?? ""
  }`.toUpperCase();

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col w-full bg-[#f9f9f9] min-h-screen">
      {/* Header */}
      <div className="h-40 bg-gradient-to-r from-primary to-[#6886AC]" />

      {/* Profile Box */}
      <div className="relative -mt-20 mx-auto w-[90%] max-w-2xl bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 bg-primary text-white rounded-lg flex items-center justify-center text-3xl font-bold border-4 border-white shadow-sm">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              {authUser?.firstName} {authUser?.lastName}
            </h1>
          </div>
        </div>

        {/* Info List */}
        <div className="mt-8 space-y-4">
          {/* Full Name */}
          <div className="flex items-center gap-3 text-primaryText">
            <User size={20} />
            <span className="text-sm">
              {authUser?.firstName} {authUser?.lastName}
            </span>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3 text-primaryText">
            <EnvelopeSimple size={20} />
            <span className="text-sm">{authUser?.email || "No email"}</span>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3 text-primaryText">
            <Phone size={20} />
            <span className="text-sm">
              {authUser?.phoneNumber || "No phone"}
            </span>
          </div>

          {/* Date Joined */}
          <div className="flex items-center gap-3 text-primaryText">
            <Calendar size={20} />
            <span className="text-sm">
              Joined: {formatDate(authUser?.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ITProfile;