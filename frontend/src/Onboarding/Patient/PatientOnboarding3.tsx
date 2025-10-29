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

  const handleSubmit = async () => {
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

    // Prepare final user data
    const finalData = {
      ...signupData,
      allergies: formattedAllergies,
      medicalHistory: formattedMedicalHistory,
    };

    // Update context so signupData reflects the formatted arrays
    setSignupData({
      allergies: formattedAllergies,
      medicalHistory: formattedMedicalHistory,
    });

    // Format allergies and medical history (use formatted arrays from inputs)
    const finalAllergies = formattedAllergies;
    const finalMedHistory = formattedMedicalHistory;
    const finalAddress = `${signupData.street}, ${signupData.city}, ${signupData.state} ${signupData.zipcode}`;

    // Restructure finalData to match backend model
    const finalPayload = {
      firstName: signupData.firstName,
      lastName: signupData.lastName,
      email: signupData.email,
      phone: signupData.phone,
      sex: signupData.sex,
      username: signupData.username,
      password: signupData.password,
      birthdate: signupData.birthdate,
      address: finalAddress,
      ec_name: signupData.contact_name,
      ec_relationship: signupData.contact_relationship,
      ec_phone: signupData.contact_phone,
      bloodtype: signupData.bloodType,
      allergies: finalAllergies,
      medicalHistory: finalMedHistory,
    };

    console.log("Final signupData:", finalPayload);

    try {
      const response = await fetch("http://localhost:5050/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });

      if (!response.ok) {
        const error = await response.text();
        alert("Failed to create user: " + error);
        return;
      }

      navigate("/patientdashboard");
    } catch (err) {
      console.error("Error creating user:", err);
      alert("An unexpected error occurred. Please try again.");
    }
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
        className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96"
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

        {/* Finish */}
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
