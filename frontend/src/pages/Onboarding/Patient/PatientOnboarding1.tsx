import React from "react";
import Field from "../../../components/input/Field";
import PrimaryButton from "../../../components/buttons/PrimaryButton";
import OnboardingLayout from "../../../components/layouts/OnboardingLayout";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../../contexts/SignUpContext";

const PatientOnboarding1: React.FC = () => {
  const navigate = useNavigate();
  const { signupData, setSignupData } = useSignup();
  const [errors, setErrors] = React.useState<{
    birthdate?: string;
    street?: string;
    city?: string;
    state?: string;
    zipcode?: string;
  }>({});

  const handleChange =
    (field: keyof typeof signupData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSignupData({ ...signupData, [field]: e.target.value });
    };

  const validate = () => {
    const errs: typeof errors = {};

    const birthdateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    if (!signupData.birthdate?.trim()) {
      errs.birthdate = "Please enter a birthdate";
    } else if (!birthdateRegex.test(signupData.birthdate)) {
      errs.birthdate = "Use MM/DD/YYYY format";
    }

    if (!signupData.street?.trim()) {
      errs.street = "Enter a street address";
    }

    if (!signupData.city?.trim()) {
      errs.city = "Enter a city";
    }

    const stateRegex = /^[A-Za-z]{2}$/;
    if (!signupData.state?.trim()) {
      errs.state = "Enter a state";
    } else if (!stateRegex.test(signupData.state)) {
      errs.state = "State must be 2 letters (e.g., MA)";
    }

    const zipRegex = /^\d{5}$/;
    if (!signupData.zipcode?.trim()) {
      errs.zipcode = "Enter a zip code";
    } else if (!zipRegex.test(signupData.zipcode)) {
      errs.zipcode = "Zipcode must be 5 digits";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    navigate("/patientonboarding2");
  };

  return (
    <OnboardingLayout title="Almost there!">
      <div className="w-full max-w-lg flex flex-col gap-6">
        {/* Birthdate */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">Birthdate</label>
          <Field
            placeholder="MM/DD/YYYY"
            value={signupData.birthdate || ""}
            onChange={handleChange("birthdate")}
          />
          {errors.birthdate && (
            <span className="text-sm text-red-500 mt-1">
              {errors.birthdate}
            </span>
          )}
        </div>

        {/* Address Section */}
        <div className="flex flex-col gap-4">
          <label className="text-gray-600 font-medium">Address</label>

          <Field
            placeholder="Street Address"
            value={signupData.street || ""}
            onChange={handleChange("street")}
          />
          {errors.street && (
            <span className="text-sm text-red-500">{errors.street}</span>
          )}

          <div className="flex gap-4">
            <div className="flex-1">
              <Field
                placeholder="City"
                value={signupData.city || ""}
                onChange={handleChange("city")}
              />
              {errors.city && (
                <span className="text-sm text-red-500">{errors.city}</span>
              )}
            </div>
            <div className="w-24">
              <Field
                placeholder="State"
                value={signupData.state || ""}
                onChange={handleChange("state")}
              />
              {errors.state && (
                <span className="text-sm text-red-500">{errors.state}</span>
              )}
            </div>
          </div>

          <Field
            placeholder="Zip Code"
            value={signupData.zipcode || ""}
            onChange={handleChange("zipcode")}
          />
          {errors.zipcode && (
            <span className="text-sm text-red-500">{errors.zipcode}</span>
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

export default PatientOnboarding1;
