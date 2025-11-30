import React from "react";
import { useNavigate } from "react-router-dom";
import RoleSelectionButton from "../../../components/buttons/RoleSelectionButton";
import { useSignup } from "../../../contexts/SignUpContext";
import { useAuth } from "../../../contexts/AuthContext";
import OnboardingLayout from "components/layouts/OnboardingLayout";
import { financeService, itService, opsService } from "api";

const DoctorLogo = "/Stethoscope.svg";
const ITLogo = "/Code.svg";
const FinanceLogo = "/XSquare.svg";
const OpsLogo = "/GearSix.svg";

const StaffOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { signupData } = useSignup();
  const { login } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const basePayload = {
    firstName: signupData.firstName,
    lastName: signupData.lastName,
    email: signupData.email,
    phoneNumber: signupData.phone,
    gender: signupData.sex,
    username: signupData.username,
    password: signupData.password,
  };

  // Helper to handle all staff account creation
  const handleStaffCreation = async (
    role: "finance" | "it" | "ops",
    createFn: (data: any) => Promise<any>,
    redirect: string
  ) => {
    try {
      setLoading(true);
      const response = await createFn(basePayload);
      const { token, user } = response || {};

      if (token && user) login(token, user);

      navigate(redirect);
    } catch (error: any) {
      console.error(`Error creating ${role} user:`, error);
      alert(
        error?.response?.data?.message ||
          `Failed to create ${role} account. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout title="I'm a new...">
      <div className="w-full max-w-lg mx-auto flex flex-col gap-6">
        {/* Doctor */}
        <RoleSelectionButton
          text="Doctor"
          icon={<img src={DoctorLogo} alt="Doctor Icon" className="w-6 h-6" />}
          variant="primary"
          size="medium"
          onClick={() => navigate("/doctoronboarding")}
        />

        {/* Finance */}
        <RoleSelectionButton
          text="Finance"
          icon={
            <img src={FinanceLogo} alt="Finance Icon" className="w-6 h-6" />
          }
          variant="primary"
          size="medium"
          onClick={() =>
            handleStaffCreation(
              "finance",
              financeService.create,
              "/financedashboard"
            )
          }
        />

        {/* IT */}
        <RoleSelectionButton
          text="IT"
          icon={<img src={ITLogo} alt="IT Icon" className="w-6 h-6" />}
          variant="primary"
          size="medium"
          onClick={() =>
            handleStaffCreation("it", itService.create, "/itdashboard")
          }
        />

        {/* Ops */}
        <RoleSelectionButton
          text="Ops"
          icon={<img src={OpsLogo} alt="Ops Icon" className="w-6 h-6" />}
          variant="primary"
          size="medium"
          onClick={() =>
            handleStaffCreation("ops", opsService.create, "/opsdashboard")
          }
        />
      </div>
    </OnboardingLayout>
  );
};

export default StaffOnboarding;
