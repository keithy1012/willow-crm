import React from "react";
import Field from "../../components/input/Field";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../contexts/SignUpContext";
import OnboardingLayout from "components/layouts/OnboardingLayout";

const SignUp3: React.FC = () => {
  const navigate = useNavigate();
  const { signupData, setSignupData } = useSignup();
  const [errors, setErrors] = React.useState<{
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleChange =
    (field: keyof typeof signupData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setSignupData({ ...signupData, [field]: e.target.value });

  const validate = () => {
    const errs: typeof errors = {};

    if (!signupData.username?.trim()) errs.username = "Please enter a username";
    if (!signupData.password?.trim()) errs.password = "Please enter a password";
    if (signupData.password !== signupData.confirmPassword)
      errs.confirmPassword = "Passwords don't match!";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    console.log("Final signup data:", signupData);
    navigate("/roleselection");
  };

  return (
    <OnboardingLayout title="Almost there!">
      <div className="flex flex-col gap-6">
        <label className="text-gray-600 mb-2">Username</label>
        <Field
          placeholder="vednaykude"
          value={signupData.username || ""}
          onChange={handleChange("username")}
        />
        <label className="text-gray-600 mb-2">Password</label>
        <Field
          type="password"
          placeholder="••••••••"
          value={signupData.password || ""}
          onChange={handleChange("password")}
        />
        <label className="text-gray-600 mb-2">Confirm Password</label>
        <Field
          type="password"
          placeholder="••••••••"
          value={signupData.confirmPassword || ""}
          onChange={handleChange("confirmPassword")}
        />

        <div className="mt-6 w-full flex justify-center">
          <PrimaryButton
            text="Finish"
            variant="primary"
            size="small"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default SignUp3;
