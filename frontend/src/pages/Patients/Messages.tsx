import React from "react";
import BaseMessages from "components/messages/BaseMessages";
import { useRequireRole } from "hooks/useRequireRole";

const PatientMessages: React.FC = () => {
  useRequireRole("Patient");

  return (
    <BaseMessages
      userRole="Patient"
      allowNewConversations={true}
      showOnlineStatus={true}
      conversationFilters={undefined}
    />
  );
};

export default PatientMessages;
