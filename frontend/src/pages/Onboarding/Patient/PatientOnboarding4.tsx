import React, { useState } from "react";
import PrimaryButton from "../../../components/buttons/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../../contexts/SignUpContext";

const TopRightBlob = "/onboarding_blob_top_right.svg";
const BottomLeftBlob = "/onboarding_blob_bottom_left.svg";

const PatientOnboarding4: React.FC = () => {
  const navigate = useNavigate();
  const { signupData, setSignupData } = useSignup();

  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  const [errors, setErrors] = useState<{
    front?: string;
    back?: string;
  }>({});

  const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16 MB in bytes

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return "Image must be less than 16 MB";
    }
    if (!file.type.startsWith("image/")) {
      return "File must be an image";
    }
    return null;
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "front" | "back"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setErrors((prev) => ({ ...prev, [side]: error }));
      return;
    }

    // Clear error for this side
    setErrors((prev) => ({ ...prev, [side]: undefined }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (side === "front") {
        setFrontImage(file);
        setFrontPreview(reader.result as string);
      } else {
        setBackImage(file);
        setBackPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (side: "front" | "back") => {
    if (side === "front") {
      setFrontImage(null);
      setFrontPreview(null);
    } else {
      setBackImage(null);
      setBackPreview(null);
    }
    setErrors((prev) => ({ ...prev, [side]: undefined }));
  };

  const validate = () => {
    const errs: typeof errors = {};
    if (!frontImage) errs.front = "Please upload front of insurance card";
    if (!backImage) errs.back = "Please upload back of insurance card";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // Update context with insurance card images
    setSignupData({
      insuranceCardFront: frontImage,
      insuranceCardBack: backImage,
    });

    // Prepare final address
    const finalAddress = `${signupData.street}, ${signupData.city}, ${signupData.state} ${signupData.zipcode}`;

    // Convert images to base64
    const frontImageBase64 = frontImage ? await fileToBase64(frontImage) : null;
    const backImageBase64 = backImage ? await fileToBase64(backImage) : null;

    // Restructure data to match backend model
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
      allergies: signupData.allergies,
      medicalHistory: signupData.medicalHistory,
      insuranceCardFront: frontImageBase64,
      insuranceCardBack: backImageBase64,
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

      const result = await response.json();
      console.log("User created successfully:", result);

      // Navigate to dashboard
      navigate("/patientdashboard");
    } catch (err) {
      console.error("Error creating user:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
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

      <div className="z-10 w-full max-w-2xl mx-auto mt-32 flex flex-col gap-6">
        <div>
          <p className="text-xl md:text-2xl font-semibold text-gray-700">
            Insurance Card
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Upload photos of your insurance card (max 16 MB per image)
          </p>
        </div>

        {/* Front of Card */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2 font-medium">
            Front of Insurance Card
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary transition-colors">
            {frontPreview ? (
              <div className="relative">
                <img
                  src={frontPreview}
                  alt="Front of insurance card"
                  className="w-full h-64 object-contain rounded"
                />
                <button
                  onClick={() => handleRemoveImage("front")}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center cursor-pointer">
                <svg
                  className="w-12 h-12 text-gray-400 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  PNG, JPG, JPEG (max 16 MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "front")}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {errors.front && (
            <span className="text-sm text-red-500 mt-1">{errors.front}</span>
          )}
        </div>

        {/* Back of Card */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2 font-medium">
            Back of Insurance Card
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary transition-colors">
            {backPreview ? (
              <div className="relative">
                <img
                  src={backPreview}
                  alt="Back of insurance card"
                  className="w-full h-64 object-contain rounded"
                />
                <button
                  onClick={() => handleRemoveImage("back")}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center cursor-pointer">
                <svg
                  className="w-12 h-12 text-gray-400 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  PNG, JPG, JPEG (max 16 MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "back")}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {errors.back && (
            <span className="text-sm text-red-500 mt-1">{errors.back}</span>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-6 w-full flex justify-center gap-4">
          <PrimaryButton
            text="Finish"
            variant="primary"
            size="small"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default PatientOnboarding4;
