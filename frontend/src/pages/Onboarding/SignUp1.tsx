import React from "react";
import Field from "../../components/input/Field";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../../contexts/SignUpContext";
import OnboardingLayout from "components/layouts/OnboardingLayout";

const SignUp1: React.FC = () => {
  const navigate = useNavigate();
  const { signupData, setSignupData } = useSignup();
  const [errors, setErrors] = React.useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
  }>({});
  const [checkingEmail, setCheckingEmail] = React.useState(false);

  const handleChange =
    (field: keyof typeof signupData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setSignupData({ ...signupData, [field]: e.target.value });

  const validate = async () => {
    const errs: typeof errors = {};

    if (!signupData.firstName?.trim())
      errs.firstName = "Please enter a first name";
    if (!signupData.lastName?.trim())
      errs.lastName = "Please enter a last name";

    if (!signupData.email?.trim()) {
      errs.email = "Please enter an email";
    } else {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(signupData.email)) {
        errs.email = "Please enter a valid email address";
      } else {
        setCheckingEmail(true);
        try {
          const res = await fetch(
            `/api/users/email-check?email=${encodeURIComponent(
              signupData.email
            )}`
          );
          const data = await res.json();
          if (data.exists) errs.email = "This email is already in use";
        } catch {
          errs.email = "Error checking email. Please try again.";
        } finally {
          setCheckingEmail(false);
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextPage = async () => {
    if (await validate()) navigate("/signup2");
  };

  return (
    <OnboardingLayout title="Welcome! Please fill in your details:">
      <div className="flex flex-col gap-6">
        {/* First Name */}
        <label className="text-gray-600 mb-2">First Name</label>
        <Field
          placeholder="Ved"
          value={signupData.firstName}
          onChange={handleChange("firstName")}
        />

        {/* Last Name */}
        <label className="text-gray-600 mb-2">Last Name</label>
        <Field
          placeholder="Naykude"
          value={signupData.lastName}
          onChange={handleChange("lastName")}
        />

        {/* Email */}
        <label className="text-gray-600 mb-2">Email</label>
        <Field
          placeholder="ved.naykude@palantir.com"
          value={signupData.email}
          onChange={handleChange("email")}
        />

        <div className="mt-6 w-full flex justify-center">
          <PrimaryButton
            text={checkingEmail ? "Checking..." : "Next"}
            variant="primary"
            size="small"
            onClick={nextPage}
            disabled={checkingEmail}
          />
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default SignUp1;
