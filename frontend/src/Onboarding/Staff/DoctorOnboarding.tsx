import React from "react";
import Field from "../../components/input/Field.tsx";
import PrimaryButton from "../../components/buttons/PrimaryButton.tsx";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../context/SignUpContext.tsx";

const TopRightBlob = "/onboarding_blob_top_right.svg";
const BottomLeftBlob = "/onboarding_blob_bottom_left.svg";

const DoctorOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { signupData, setSignupData } = useSignup();
  const [errors, setErrors] = React.useState<{
    bioContent?: String,
    education?: String,
    graduationDate?: String,
    speciality?: String
  }>({});

  const handleChange =
    (field: keyof typeof signupData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSignupData({ ...signupData, [field]: e.target.value });
    };

const validate = () => {
  const errs: typeof errors = {};

  if (!signupData.bioContent?.trim()) {
    errs.bioContent = "Enter your biography!";
  }
  if (!signupData.education?.trim()) {
    errs.education = "Enter your education!";
  }
  if (!signupData.speciality?.trim()) {
    errs.speciality = "Enter a speciality!";
  }
  if (!signupData.graduationDate?.trim()) {
    errs.graduationDate = "Enter your graduation date!";
  }

  const gradDateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
  if (!signupData.graduationDate?.trim()) {
    errs.graduationDate = "Please enter a birthdate";
  } else if (!gradDateRegex.test(signupData.graduationDate)) {
    errs.graduationDate = "Use MM/DD/YYYY format";
  }


  setErrors(errs);
  return Object.keys(errs).length === 0;
};

  const handleSubmit = () => {
    if (!validate()) return;
    /* CREATE A DOCTOR REQUEST TICKET */
    console.log("Final signup data:", signupData);
    navigate("/patientonboarding2");
  };

  return (
    <div className="relative w-full min-h-screen bg-white flex flex-col items-start p-8 overflow-hidden">
      <img src={TopRightBlob} alt="Top Right Blob" className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96" />
      <img src={BottomLeftBlob} alt="Bottom Left Blob" className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96" />

      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 z-10 absolute top-8 left-8">
        Willow CRM
      </h1>

      <div className="z-10 w-full max-w-lg mx-auto mt-32 flex flex-col gap-6">
        <p className="text-xl md:text-2xl font-semibold text-gray-700">Almost there!</p>

        {/* Bio Content */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">Bio Content</label>
          <Field
            placeholder="Bio Content"
            value={signupData.bioContent || ""}
            onChange={handleChange("bioContent")}
          />
          {errors.bioContent && <span className="text-sm text-red-500 mt-1">{errors.bioContent}</span>}
        </div>

        {/* Education */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">Education</label>
          <Field
            placeholder="Ex: Harvard Medical School"
            value={signupData.education || ""}
            onChange={handleChange("education")}
          />
          {errors.education && <span className="text-sm text-red-500 mt-1">{errors.education}</span>}
        </div>

        {/* Graduation Date */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">Graduation Date</label>
          <Field
            placeholder="Ex: 1990"
            value={signupData.graduationDate || ""}
            onChange={handleChange("graduationDate")}
          />
          {errors.graduationDate && <span className="text-sm text-red-500 mt-1">{errors.graduationDate}</span>}
        </div>

        {/* Speciality */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">Speciality</label>
          <Field
            placeholder="Ex: Cardiology"
            value={signupData.speciality || ""}
            onChange={handleChange("speciality")}
          />
          {errors.speciality && <span className="text-sm text-red-500 mt-1">{errors.speciality}</span>}
        </div>


        {/* Finish */}
        <div className="mt-6 w-full flex justify-center">
          <PrimaryButton text="Done" variant="primary" size="small" onClick={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default DoctorOnboarding;
