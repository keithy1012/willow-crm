import React, { useState } from "react";
import PrimaryButton from "../../../components/buttons/PrimaryButton";
import OnboardingLayout from "../../../components/layouts/OnboardingLayout";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../../contexts/SignUpContext";
import { patientService } from "../../../api";

const PatientOnboarding4: React.FC = () => {
  const navigate = useNavigate();
  const { signupData, setSignupData } = useSignup();

  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<{
    front?: string;
    back?: string;
    submit?: string;
  }>({});

  const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16 MB

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

    setErrors((prev) => ({ ...prev, [side]: undefined }));

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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const finalAddress = `${signupData.street}, ${signupData.city}, ${signupData.state} ${signupData.zipcode}`;

      const frontImageBase64 = frontImage
        ? await fileToBase64(frontImage)
        : null;
      const backImageBase64 = backImage ? await fileToBase64(backImage) : null;

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

      // Use the patient service instead of direct fetch
      const result = await patientService.create(finalPayload);
      console.log("User created successfully:", result);

      // Store auth token if returned
      if (result.token) {
        localStorage.setItem("token", result.token);
      }

      navigate("/patientdashboard");
    } catch (err) {
      console.error("Error creating user:", err);
      setErrors({ submit: "Failed to create account. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const FileUploadBox = ({
    side,
    preview,
  }: {
    side: "front" | "back";
    preview: string | null;
  }) => (
    <div className="flex flex-col">
      <label className="text-gray-600 mb-2 font-medium">
        {side === "front" ? "Front" : "Back"} of Insurance Card
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary transition-colors">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt={`${side} of insurance card`}
              className="w-full h-64 object-contain rounded"
            />
            <button
              onClick={() => handleRemoveImage(side)}
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
              onChange={(e) => handleFileChange(e, side)}
              className="hidden"
            />
          </label>
        )}
      </div>
      {errors[side] && (
        <span className="text-sm text-red-500 mt-1">{errors[side]}</span>
      )}
    </div>
  );

  return (
    <OnboardingLayout
      title="Insurance Card"
      subtitle="Upload photos of your insurance card (max 16 MB per image)"
    >
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <FileUploadBox side="front" preview={frontPreview} />
        <FileUploadBox side="back" preview={backPreview} />

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errors.submit}
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-6 w-full flex justify-center">
          <PrimaryButton
            text={isSubmitting ? "Creating Account..." : "Finish"}
            variant="primary"
            size="small"
            onClick={handleSubmit}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default PatientOnboarding4;
