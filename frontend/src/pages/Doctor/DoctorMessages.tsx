import React from "react";
import BaseMessages from "components/messages/BaseMessages";
import { useRequireRole } from "hooks/useRequireRole";
import PrimaryButton from "components/buttons/PrimaryButton";
import { useNavigate } from "react-router-dom";

const DoctorMessages: React.FC = () => {
  const [filterMode, setFilterMode] = React.useState<
    "all" | "patients" | "doctors"
  >("all");

  useRequireRole("Doctor");
  const navigate = useNavigate();
  const handleViewProfile = (userId: string) => {
    // For doctors viewing profiles, need to determine if it's a patient or doctor
    // For now, navigate to patient profile page
    // You might need to check the user's role first
    navigate(`/patient/${userId}`);
  };
  const getFilters = () => {
    switch (filterMode) {
      case "patients":
        return { showOnlyRole: ["Patient"] };
      case "doctors":
        return { showOnlyRole: ["Doctor"] };
      default:
        return undefined;
    }
  };

  const customActions = (
    <div className="flex items-center mr-1 gap-1.5">
      <PrimaryButton
        text="All"
        onClick={() => setFilterMode("all")}
        variant="outline"
        size="xs"
        className="w-[60px]"
        controlled={true}
        selected={filterMode === "all"}
        toggleable={false}
      />
      <PrimaryButton
        text="Patients"
        onClick={() => setFilterMode("patients")}
        variant="outline"
        size="xs"
        className="w-[60px]"
        controlled={true}
        selected={filterMode === "patients"}
        toggleable={false}
      />
      <PrimaryButton
        text="Doctors"
        onClick={() => setFilterMode("doctors")}
        variant="outline"
        className="w-[60px]"
        size="xs"
        controlled={true}
        selected={filterMode === "doctors"}
        toggleable={false}
      />
    </div>
  );

  return (
    <BaseMessages
      userRole="Doctor"
      allowNewConversations={true}
      showOnlineStatus={true}
      conversationFilters={getFilters()}
      customActions={customActions}
      onViewProfile={handleViewProfile}
    />
  );
};

export default DoctorMessages;
