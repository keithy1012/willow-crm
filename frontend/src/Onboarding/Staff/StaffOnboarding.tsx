import React from "react";
import { useNavigate } from "react-router-dom";
import RoleSelectionButton from "../../components/buttons/RoleSelectionButton";
import { useSignup } from "../../context/SignUpContext";

const TopRightBlob = "/onboarding_blob_top_right.svg";
const BottomLeftBlob = "/onboarding_blob_bottom_left.svg";
const DoctorLogo = "/Stethoscope.svg";
const ITLogo = "/Code.svg";
const FinanceLogo = "/XSquare.svg";
const OpsLogo = "/GearSix.svg";

const StaffOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { signupData } = useSignup();

  const buildBasePayload = () => ({
    firstName: signupData.firstName,
    lastName: signupData.lastName,
    email: signupData.email,
    phone: signupData.phone,
    sex: signupData.sex,
    username: signupData.username,
    password: signupData.password,
  });

  const createUser = async (endpoint: string, redirect: string) => {
    const payload = buildBasePayload();
    console.log("Sending payload to create ", endpoint, ": ", payload);

    try {
      const res = await fetch(`http://localhost:5050/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error("Error:", error);
        alert("Failed to create user: " + error);
        return;
      }

      navigate(redirect);
    } catch (error) {
      console.error("Request failed:", error);
      alert("Unexpected error. Please try again.");
    }
  };

  const directDoctor = () => {
    console.log("Doctor selected");
    navigate("/doctoronboarding");
  };

  const directIT = () => createUser("itMembers", "/itdashboard");
  const directFinance = () => createUser("financeMembers", "/financedashboard");
  const directOps = () => createUser("opsMembers", "/opsdashboard");

  return (
    <div className="relative w-full min-h-screen bg-white flex flex-col items-start p-8 overflow-hidden">
      <img
        src={TopRightBlob}
        alt="Top Right Blob"
        className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96"
      />
      <img
        src={BottomLeftBlob}
        alt="Bottom Left Blob"
        className="absolute bottom-0 left-[-15px] w-64 h-64 md:w-96 md:h-96"
      />

      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 z-10 absolute top-8 left-8">
        Willow CRM
      </h1>

      <div className="z-10 w-full max-w-lg mx-auto mt-32 flex flex-col gap-6">
        <p className="text-xl md:text-2xl font-semibold text-gray-700">
          I'm a new...
        </p>

        <RoleSelectionButton
          text="Doctor"
          icon={<img src={DoctorLogo} alt="Doctor Icon" className="w-6 h-6" />}
          variant="primary"
          size="medium"
          onClick={directDoctor}
        />

        <RoleSelectionButton
          text="Finance"
          icon={
            <img src={FinanceLogo} alt="Finance Icon" className="w-6 h-6" />
          }
          variant="primary"
          size="medium"
          onClick={directFinance}
        />

        <RoleSelectionButton
          text="IT"
          icon={<img src={ITLogo} alt="IT Icon" className="w-6 h-6" />}
          variant="primary"
          size="medium"
          onClick={directIT}
        />

        <RoleSelectionButton
          text="Ops"
          icon={<img src={OpsLogo} alt="Ops Icon" className="w-6 h-6" />}
          variant="primary"
          size="medium"
          onClick={directOps}
        />
      </div>
    </div>
  );
};

export default StaffOnboarding;
