import React from "react";
import { useNavigate } from "react-router-dom";
import RoleSelectionButton from "../../components/buttons/RoleSelectionButton";
import OnboardingLayout from "components/layouts/OnboardingLayout";

const StaffIcon = "/FirstAid.svg";
const PatientIcon = "/userPlus.svg";

const RoleSelection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <OnboardingLayout title="I'm a new...">
      <div className="flex flex-col items-center justify-center mt-20 space-y-6">
        {/* Patient */}
        <RoleSelectionButton
          text="Patient"
          icon={
            <img src={PatientIcon} alt="Patient Icon" className="w-6 h-6" />
          }
          variant="primary"
          size="medium"
          onClick={() => navigate("/patientonboarding1")}
        />

        {/* Staff */}
        <RoleSelectionButton
          text="Staff"
          icon={<img src={StaffIcon} alt="Staff Icon" className="w-6 h-6" />}
          variant="primary"
          size="medium"
          onClick={() => navigate("/staffonboarding")}
        />
      </div>
    </OnboardingLayout>
  );
};

export default RoleSelection;
