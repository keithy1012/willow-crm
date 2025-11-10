import React from "react";
import Field from "../../components/input/Field";
import Dropdown from "../../components/input/Dropdown";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../contexts/SignUpContext";
import OnboardingLayout from "components/layouts/OnboardingLayout";

const SignUp2: React.FC = () => {
  const navigate = useNavigate();
  const { signupData, setSignupData } = useSignup();
  const [errors, setErrors] = React.useState<{ phone?: string; sex?: string }>(
    {}
  );

  const handleChange =
    (field: keyof typeof signupData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setSignupData({ ...signupData, [field]: e.target.value });

  const handleSelectChange = (value: string) =>
    setSignupData({ ...signupData, sex: value });

  const validate = () => {
    const errs: typeof errors = {};
    const phone = signupData.phone?.trim();

    if (!phone) errs.phone = "Please enter a phone number";
    else if (!/^[0-9+\-() ]+$/.test(phone))
      errs.phone = "Please enter a valid phone number";

    if (!signupData.sex?.trim()) errs.sex = "Please select your sex";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextPage = () => {
    if (validate()) navigate("/signup3");
  };

  return (
    <OnboardingLayout title="Nice to meet you!">
      <div className="flex flex-col gap-6">
        <label className="text-gray-600 mb-2">Phone Number</label>
        <Field
          placeholder="(123)-456-7890"
          value={signupData.phone}
          onChange={handleChange("phone")}
        />
        <Dropdown
          label="Sex"
          value={signupData.sex}
          onChange={handleSelectChange}
          options={["Male", "Female", "Other"]}
          placeholder="Select your sex"
        />
        <div className="mt-6 w-full flex justify-center">
          <PrimaryButton
            text="Next"
            variant="primary"
            size="small"
            onClick={nextPage}
          />
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default SignUp2;
