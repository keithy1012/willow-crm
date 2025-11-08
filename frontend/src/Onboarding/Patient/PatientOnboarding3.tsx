// PatientOnboarding3.tsx
import React, { useState } from "react";
import Field from "../../components/input/Field";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../context/SignUpContext";

const TopRightBlob = "/onboarding_blob_top_right.svg";
const BottomLeftBlob = "/onboarding_blob_bottom_left.svg";

const PatientOnboarding3: React.FC = () => {
  const navigate = useNavigate();
  const { signupData, setSignupData } = useSignup();

  // Temporary state for comma-separated inputs
  const [allergiesInput, setAllergiesInput] = useState(
    signupData.allergies.join(", ")
  );
  const [medicalHistoryInput, setMedicalHistoryInput] = useState(
    signupData.medicalHistory.join(", ")
  );

  const [errors, setErrors] = useState<{
    allergies?: string;
    medicalHistory?: string;
  }>({});

  const validate = () => {
    const errs: typeof errors = {};
    if (!allergiesInput.trim()) errs.allergies = "Please enter allergies";
    if (!medicalHistoryInput.trim())
      errs.medicalHistory = "Please enter medical history";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // Format allergies and medical history
    const formattedAllergies = (allergiesInput || "")
      .split(",")
      .map((a: string) => a.trim())
      .filter((a: string) => a.length > 0);

    const formattedMedicalHistory = (medicalHistoryInput || "")
      .split(",")
      .map((m: string) => m.trim())
      .filter((m: string) => m.length > 0);

    // Update context with formatted arrays
    setSignupData({
      allergies: formattedAllergies,
      medicalHistory: formattedMedicalHistory,
    });

    // Navigate to insurance card upload page
    navigate("/patientonboarding4");
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
          Medical Info
        </p>

        {/* Allergies */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">Allergies</label>
          <Field
            placeholder="peanuts, pollen, mushrooms"
            value={allergiesInput}
            onChange={(e) => setAllergiesInput(e.target.value)}
          />
          {errors.allergies && (
            <span className="text-sm text-red-500 mt-1">
              {errors.allergies}
            </span>
          )}
        </div>

        {/* Medical History */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">Medical History</label>
          <Field
            placeholder="asthma, diabetes"
            value={medicalHistoryInput}
            onChange={(e) => setMedicalHistoryInput(e.target.value)}
          />
          {errors.medicalHistory && (
            <span className="text-sm text-red-500 mt-1">
              {errors.medicalHistory}
            </span>
          )}
        </div>

        {/* Next */}
        <div className="mt-6 w-full flex justify-center">
          <PrimaryButton
            text="Next"
            variant="primary"
            size="small"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default PatientOnboarding3;