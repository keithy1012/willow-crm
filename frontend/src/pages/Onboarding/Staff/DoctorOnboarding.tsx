import React from "react";
import { useNavigate } from "react-router-dom";
import Field from "../../../components/input/Field";
import PrimaryButton from "../../../components/buttons/PrimaryButton";
import { useSignup } from "../../../contexts/SignUpContext";
import { DoctorAccountCreationTicket, ticketService } from "api";
import OnboardingLayout from "components/layouts/OnboardingLayout";

const DoctorOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { signupData, setSignupData } = useSignup();
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  const handleChange =
    (field: keyof typeof signupData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSignupData({ ...signupData, [field]: e.target.value });
    };

  const validate = () => {
    const errs: Record<string, string> = {};
    const { bioContent, education, speciality, graduationDate } = signupData;

    if (!bioContent?.trim()) errs.bioContent = "Enter your biography!";
    if (!education?.trim()) errs.education = "Enter your education!";
    if (!speciality?.trim()) errs.speciality = "Enter a speciality!";

    const gradDateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    if (!graduationDate?.trim()) {
      errs.graduationDate = "Enter your graduation date!";
    } else if (!gradDateRegex.test(graduationDate)) {
      errs.graduationDate = "Use MM/DD/YYYY format";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const finalPayload: Partial<DoctorAccountCreationTicket> = {
      firstName: signupData.firstName,
      lastName: signupData.lastName,
      email: signupData.email,
      phoneNumber: signupData.phone,
      username: signupData.username,
      password: signupData.password,
      gender: signupData.sex,
      bioContent: signupData.bioContent,
      education: signupData.education,
      graduationDate: new Date(signupData.graduationDate),
      speciality: signupData.speciality,
      status: "Pending",
      notes: "Submitted initial credentials for review.",
    };

    try {
      setLoading(true);
      await ticketService.doctorCreation.submit(finalPayload);
      alert("Doctor account creation request submitted! Awaiting approval.");
      navigate("/");
    } catch (error: any) {
      console.error("Error submitting doctor request:", error);
      alert(
        error?.response?.data?.message ||
          "Unexpected error — please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout title="Almost there!">
      <div className="w-full max-w-lg mx-auto flex flex-col gap-6">
        {/* Bio Content */}
        <div>
          <label className="text-gray-600 mb-2 block">Bio Content</label>
          <Field
            placeholder="Tell us about yourself"
            value={signupData.bioContent || ""}
            onChange={handleChange("bioContent")}
          />
          {errors.bioContent && (
            <p className="text-sm text-red-500 mt-1">{errors.bioContent}</p>
          )}
        </div>

        {/* Education */}
        <div>
          <label className="text-gray-600 mb-2 block">Education</label>
          <Field
            placeholder="Ex: Harvard Medical School"
            value={signupData.education || ""}
            onChange={handleChange("education")}
          />
          {errors.education && (
            <p className="text-sm text-red-500 mt-1">{errors.education}</p>
          )}
        </div>

        {/* Graduation Date */}
        <div>
          <label className="text-gray-600 mb-2 block">Graduation Date</label>
          <Field
            placeholder="MM/DD/YYYY"
            value={signupData.graduationDate || ""}
            onChange={handleChange("graduationDate")}
          />
          {errors.graduationDate && (
            <p className="text-sm text-red-500 mt-1">{errors.graduationDate}</p>
          )}
        </div>

        {/* Speciality */}
        <div>
          <label className="text-gray-600 mb-2 block">Speciality</label>
          <Field
            placeholder="Ex: Cardiology"
            value={signupData.speciality || ""}
            onChange={handleChange("speciality")}
          />
          {errors.speciality && (
            <p className="text-sm text-red-500 mt-1">{errors.speciality}</p>
          )}
        </div>

        {/* Submit */}
        <div className="mt-6 w-full flex justify-center">
          <PrimaryButton
            text={loading ? "Submitting..." : "Done"}
            variant="primary"
            size="small"
            disabled={loading}
            onClick={handleSubmit}
          />
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default DoctorOnboarding;
