import React from "react";
import Field from "../../../components/input/Field";
import PrimaryButton from "../../../components/buttons/PrimaryButton";
import Dropdown from "../../../components/input/Dropdown";
import OnboardingLayout from "../../../components/layouts/OnboardingLayout";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../../contexts/SignUpContext";

const bloodTypes = ["None", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const PatientOnboarding2: React.FC = () => {
  const navigate = useNavigate();
  const { signupData, setSignupData } = useSignup();
  const [errors, setErrors] = React.useState<{
    contactName?: string;
    relationship?: string;
    phone?: string;
    bloodType?: string;
  }>({});

  const handleChange =
    (field: keyof typeof signupData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSignupData({ ...signupData, [field]: e.target.value });
    };

  const validate = () => {
    const errs: typeof errors = {};
    const phoneRegex = /^\d{10}$/;

    if (!signupData.contact_name?.trim())
      errs.contactName = "Enter contact's name";

    if (!signupData.contact_relationship?.trim())
      errs.relationship = "Enter relationship";

    if (!signupData.contact_phone?.trim()) errs.phone = "Enter phone number";
    else if (!phoneRegex.test(signupData.contact_phone))
      errs.phone = "Must be a 10-digit number";

    if (!signupData.bloodType) errs.bloodType = "Select your blood type";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    navigate("/patientonboarding3");
  };

  return (
    <OnboardingLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Emergency Contact */}
        <div className="flex flex-col gap-4">
          <p className="text-xl font-semibold text-gray-700">
            Emergency Contact
          </p>

          <Field
            placeholder="Name"
            value={signupData.contact_name || ""}
            onChange={handleChange("contact_name")}
          />
          {errors.contactName && (
            <span className="text-sm text-red-500">{errors.contactName}</span>
          )}

          <Field
            placeholder="Relationship"
            value={signupData.contact_relationship || ""}
            onChange={handleChange("contact_relationship")}
          />
          {errors.relationship && (
            <span className="text-sm text-red-500">{errors.relationship}</span>
          )}

          <Field
            placeholder="Phone Number"
            value={signupData.contact_phone || ""}
            onChange={handleChange("contact_phone")}
          />
          {errors.phone && (
            <span className="text-sm text-red-500">{errors.phone}</span>
          )}
        </div>

        {/* Blood Type */}
        <div className="flex flex-col gap-4">
          <p className="text-xl font-semibold text-gray-700">Blood Type</p>

          <Dropdown
            label="Select Blood Type"
            options={bloodTypes}
            value={signupData.bloodType}
            onChange={(value) =>
              setSignupData({
                ...signupData,
                bloodType: value === "None" ? "" : value,
              })
            }
          />
          {errors.bloodType && (
            <span className="text-sm text-red-500">{errors.bloodType}</span>
          )}
        </div>
      </div>

      {/* Next Button */}
      <div className="w-full flex justify-center mt-10">
        <PrimaryButton
          text="Next"
          variant="primary"
          size="small"
          onClick={handleSubmit}
        />
      </div>
    </OnboardingLayout>
  );
};

export default PatientOnboarding2;
