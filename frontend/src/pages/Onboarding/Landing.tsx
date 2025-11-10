import React from "react";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import OnboardingLayout from "components/layouts/OnboardingLayout";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <OnboardingLayout>
      <div className="flex flex-col items-center justify-center mt-20 space-y-4">
        <h1 className="text-6xl md:text-2xl font-bold text-gray-900 text-center">
          Modernize Healthcare
        </h1>
        <h1 className="text-6xl md:text-5xl font-bold text-gray-900 text-center">
          Willow CRM
        </h1>

        <div className="flex flex-col space-y-3 mt-8">
          <PrimaryButton
            text="Sign Up!"
            variant="primary"
            size="small"
            onClick={() => navigate("/signup1")}
          />
          <PrimaryButton
            text="Login"
            variant="primary"
            size="small"
            onClick={() => navigate("/login")}
          />
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default LandingPage;
