import React from "react";
import BaseMessages from "components/messages/BaseMessages";
import { useRequireRole } from "hooks/useRequireRole";
import PrimaryButton from "components/buttons/PrimaryButton";

const DoctorMessages: React.FC = () => {
  const [filterMode, setFilterMode] = React.useState<
    "all" | "patients" | "doctors"
  >("all");

  useRequireRole("Doctor");

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
    <div className="flex items-center mr-1 gap-1">
      <PrimaryButton
        text="All"
        onClick={() => setFilterMode("all")}
        variant="outline"
        size="small"
        className="w-[20px] h-[30px]"
        controlled={true}
        selected={filterMode === "all"}
        toggleable={false}
      />
      <PrimaryButton
        text="Patients"
        onClick={() => setFilterMode("patients")}
        variant="outline"
        size="small"
        className="w-[20px] h-[30px]"
        controlled={true}
        selected={filterMode === "patients"}
        toggleable={false}
      />
      <PrimaryButton
        text="Doctors"
        onClick={() => setFilterMode("doctors")}
        variant="outline"
        size="small"
        className="w-[20px] h-[30px]"
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
    />
  );
};

export default DoctorMessages;
