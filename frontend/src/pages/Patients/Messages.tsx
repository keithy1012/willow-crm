import React from "react";
import BaseMessages from "components/messages/BaseMessages";
import { useRequireRole } from "hooks/useRequireRole";
import { useNavigate } from "react-router-dom";
import { useSessionTimeout } from "hooks/useTimeoutSession";

const PatientMessages: React.FC = () => {
  useRequireRole("Patient");
  const navigate = useNavigate();

  // HIPAA Compliance: Auto-logout after 15 minutes of inactivity
  useSessionTimeout(15);

  const handleViewProfile = (userId: string) => {
    navigate(`/doctor/${userId}`);
  };

  return (
    <BaseMessages
      userRole="Patient"
      allowNewConversations={true}
      showOnlineStatus={true}
      conversationFilters={undefined}
      onViewProfile={handleViewProfile}
    />
  );
};

export default PatientMessages;
