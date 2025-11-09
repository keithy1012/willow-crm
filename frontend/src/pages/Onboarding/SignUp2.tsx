import React from "react";
import Field from "../../components/input/Field";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../contexts/SignUpContext";
import Dropdown from "../../components/input/Dropdown";

const TopRightBlob = "/onboarding_blob_top_right.svg";
const BottomLeftBlob = "/onboarding_blob_bottom_left.svg";

const SignUp2: React.FC = () => {
  const navigate = useNavigate();
  const { signupData, setSignupData } = useSignup();
  const [errors, setErrors] = React.useState<{ phone?: string; sex?: string }>(
    {}
  );

  const handleChange =
    (field: keyof typeof signupData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSignupData({ ...signupData, [field]: e.target.value });
    };
  const handleSelectChange = (value: string) => {
    setSignupData({ sex: value });
  };

  const validate = () => {
    const errs: { phone?: string; sex?: string } = {};

    if (!signupData.phone || !signupData.phone.trim()) {
      errs.phone = "Please enter a phone number";
    } else {
      const phoneRe = /^[0-9+\-() ]+$/;
      if (!phoneRe.test(signupData.phone))
        errs.phone = "Please enter a valid phone number";
    }

    if (!signupData.sex || !signupData.sex.trim()) {
      errs.sex = "Please select your sex";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextPage = () => {
    if (!validate()) return;
    navigate("/signup3");
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
        className="absolute bottom-0 left-[-15px] w-64 h-64 md:w-96 md:h-96"
      />

      {/* Logo */}
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 z-10 absolute top-8 left-8">
        Willow CRM
      </h1>

      {/* Main Form Content */}
      <div className="z-10 w-full max-w-lg mx-auto mt-32 flex flex-col gap-6">
        <p className="text-xl md:text-2xl font-semibold text-gray-700">
          Nice to meet you!
        </p>

        {/* Phone Number */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">Phone Number</label>
          <Field
            placeholder="(123)-456-7890"
            value={signupData.phone}
            onChange={handleChange("phone")}
          />
          {errors.phone && (
            <span className="text-sm text-red-500 mt-1">{errors.phone}</span>
          )}
        </div>

        {/* Sex */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">Sex</label>
          <Dropdown
            value={signupData.sex}
            onChange={handleSelectChange}
            options={["Male", "Female", "Other"]}
            placeholder="Select your sex"
          />
          {errors.sex && (
            <span className="text-sm text-red-500 mt-1">{errors.sex}</span>
          )}
        </div>

        {/* Next Button */}
        <div className="mt-6 w-full flex justify-center">
          <PrimaryButton
            text="Next"
            variant="primary"
            size="small"
            onClick={nextPage}
          />
        </div>
      </div>
    </div>
  );
};

export default SignUp2;
