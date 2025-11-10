import React, { useState } from "react";
import Field from "../../../components/input/Field";
import PrimaryButton from "../../../components/buttons/PrimaryButton";
import OnboardingLayout from "../../../components/layouts/OnboardingLayout";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../../contexts/SignUpContext";

const PatientOnboarding3: React.FC = () => {
  const navigate = useNavigate();
  const { signupData, setSignupData } = useSignup();

  const [allergiesInput, setAllergiesInput] = useState(
    signupData.allergies?.join(", ") || ""
  );
  const [medicalHistoryInput, setMedicalHistoryInput] = useState(
    signupData.medicalHistory?.join(", ") || ""
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

    const formattedAllergies = allergiesInput
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const formattedMedicalHistory = medicalHistoryInput
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    setSignupData({
      ...signupData,
      allergies: formattedAllergies,
      medicalHistory: formattedMedicalHistory,
    });

    navigate("/patientonboarding4");
  };

  return (
    <OnboardingLayout title="Medical Info">
      <div className="w-full max-w-lg flex flex-col gap-6">
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

        {/* Next Button */}
        <div className="mt-6 w-full flex justify-center">
          <PrimaryButton
            text="Next"
            variant="primary"
            size="small"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default PatientOnboarding3;
