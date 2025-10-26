import React from "react";
import Field from "../components/input/Field.tsx";
import PrimaryButton from "../components/buttons/PrimaryButton.tsx";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../context/SignUpContext.tsx";

const TopRightBlob = "/onboarding_blob_top_right.svg";
const BottomLeftBlob = "/onboarding_blob_bottom_left.svg";

const SignUp3: React.FC = () => {
  const navigate = useNavigate();
  const { signupData, setSignupData } = useSignup();
  const [errors, setErrors] = React.useState<{
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleChange = (field: keyof typeof signupData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData({ [field]: e.target.value });
  };

  const validate = () => {
    const errs: { username?: string; password?: string; confirmPassword?: string } = {};

    if (!signupData.username?.trim())
      errs.username = "Please enter a username";

    if (!signupData.password?.trim())
      errs.password = "Please enter a password";

    if (signupData.password !== signupData.confirmPassword)
      errs.confirmPassword = "Passwords don't match!";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    console.log("Final signup data:", signupData);
    navigate("/done");
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
        <p className="text-xl md:text-2xl font-semibold text-gray-700">Almost there!</p>

        {/* Username */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">Username</label>
          <Field
            placeholder="vednaykude"
            value={signupData.username || ""}
            onChange={handleChange("username")}
          />
          {errors.username && (
            <span className="text-sm text-red-500 mt-1">{errors.username}</span>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">Password</label>
          <Field
            type="password"
            placeholder="••••••••"
            value={signupData.password || ""}
            onChange={handleChange("password")}
          />
          {errors.password && (
            <span className="text-sm text-red-500 mt-1">{errors.password}</span>
          )}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">Confirm Password</label>
          <Field
            type="password"
            placeholder="••••••••"
            value={signupData.confirmPassword || ""}
            onChange={handleChange("confirmPassword")}
          />
          {errors.confirmPassword && (
            <span className="text-sm text-red-500 mt-1">
              {errors.confirmPassword}
            </span>
          )}
        </div>

        {/* Next / Finish */}
        <div className="mt-6 w-full flex justify-center">
          <PrimaryButton
            text={"Finish"}
            variant={"primary"}
            size={"small"}
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default SignUp3;
