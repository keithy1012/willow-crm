import React from "react";
import { useNavigate } from "react-router-dom";
import RoleSelectionButton from "../../components/buttons/RoleSelectionButton";

const TopRightBlob = "/onboarding_blob_top_right.svg";
const BottomLeftBlob = "/onboarding_blob_bottom_left.svg";
const StaffIcon = "/FirstAid.svg";
const PatientIcon = "/userPlus.svg";

const RollSelection: React.FC = () => {
  const navigate = useNavigate();

  const directPatient = () => {
    console.log("Redirecting to Patient");
    navigate("/patientonboarding1");
  };

  const directStaff = () => {
    console.log("Redirecting to Staff");
    navigate("/staffonboarding");
  };
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

        {/* Patient */}
        <div className="flex flex-col">
          <RoleSelectionButton
            text="Patient"
            icon={
              <img src={PatientIcon} alt="Patient Icon" className="w-6 h-6" />
            }
            variant="primary"
            size="medium"
            onClick={() => directPatient()}
          />
        </div>

        {/* Staff */}
        <div className="flex flex-col">
          <RoleSelectionButton
            text="Staff"
            icon={<img src={StaffIcon} alt="Staff Icon" className="w-6 h-6" />}
            variant="primary"
            size="medium"
            onClick={() => directStaff()}
          />
        </div>
      </div>
    </div>
  );
};

export default RollSelection;
