import React from "react";
import Field from "../components/input/Field";
import PrimaryButton from "../components/buttons/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../context/SignUpContext";

const TopRightBlob = "/onboarding_blob_top_right.svg";
const BottomLeftBlob = "/onboarding_blob_bottom_left.svg";

const SignUp1: React.FC = () => {
  const navigate = useNavigate();
  const { signupData, setSignupData } = useSignup();
  const [errors, setErrors] = React.useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
  }>({});

  const handleChange =
    (field: keyof typeof signupData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSignupData({ ...signupData, [field]: e.target.value });
    };

  const validate = () => {
    const errs: { firstName?: string; lastName?: string; email?: string } = {};
    if (!signupData.firstName || !signupData.firstName.trim())
      errs.firstName = "Please enter a first name";
    if (!signupData.lastName || !signupData.lastName.trim())
      errs.lastName = "Please enter a last name";
    if (!signupData.email || !signupData.email.trim()) {
      errs.email = "Please enter an email";
    } else {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(signupData.email))
        errs.email = "Please enter a valid email address";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextPage = () => {
    if (!validate()) return;
    navigate("/signup2");
  };

  return (
    <div className="relative w-full min-h-screen bg-white flex flex-col items-start p-8 overflow-hidden">
      {/* Top-right SVG */}
      <img
        src={TopRightBlob}
        alt="Top Right Blob"
        className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96"
      />

      {/* Bottom-left SVG */}
      <img
        src={BottomLeftBlob}
        alt="Bottom Left Blob"
        className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96"
      />

      {/* Willow Logo / Title */}
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 z-10 absolute top-8 left-8">
        Willow CRM
      </h1>

      {/* Main Form Content */}
      <div className="z-10 w-full max-w-lg mx-auto mt-32 flex flex-col gap-6">
        <p className="text-xl md:text-2xl font-semibold text-gray-700">
          Welcome! Please fill in your details:
        </p>

        {/* First Name */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">First Name</label>
          <Field
            placeholder="Ved"
            value={signupData.firstName}
            onChange={handleChange("firstName")}
          />
          {errors.firstName && (
            <span className="text-sm text-red-500 mt-1">
              {errors.firstName}
            </span>
          )}
        </div>

        {/* Last Name */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">Last Name</label>
          <Field
            placeholder="Naykude"
            value={signupData.lastName}
            onChange={handleChange("lastName")}
          />
          {errors.lastName && (
            <span className="text-sm text-red-500 mt-1">{errors.lastName}</span>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">Email</label>
          <Field
            placeholder="ved.naykude@palantir.com"
            value={signupData.email}
            onChange={handleChange("email")}
          />
          {errors.email && (
            <span className="text-sm text-red-500 mt-1">{errors.email}</span>
          )}
        </div>

        {/* Next Button */}
        <div className="mt-6 w-full flex justify-center">
          <PrimaryButton
            text={"Next"}
            variant={"primary"}
            size={"small"}
            onClick={nextPage}
          ></PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default SignUp1;
