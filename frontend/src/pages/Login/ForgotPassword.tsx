import React, { useState } from "react";
import Field from "../../components/input/Field";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import { useNavigate } from "react-router-dom";

const TopRightBlob = "/onboarding_blob_top_right.svg";
const BottomLeftBlob = "/onboarding_blob_bottom_left.svg";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const [errors, setErrors] = useState<{ email?: string }>({});

  const validate = () => {
    const errs: { email?: string } = {};

    if (!email) {
      errs.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errs.email = "Enter a valid email";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    /* TODO: Change this API call
    try {
        await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        });

    } catch (err) {
        console.error(err);
    }
    */

    alert("If an account exists for this email, a reset link has been sent.");

    navigate("/");
  };

  return (
    <div className="relative w-full min-h-screen bg-white flex flex-col p-8 overflow-hidden">
      {/* Background blobs */}
      <img
        src={TopRightBlob}
        alt="Top Right Blob"
        className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96"
      />
      <img
        src={BottomLeftBlob}
        alt="Bottom Left Blob"
        className="absolute bottom-0 left-[-15px] w-64 h-64 md:w-96 md:h-96"
      />

      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 absolute top-8 left-8 z-10">
        Willow CRM
      </h1>

      <div className="z-10 w-full max-w-lg mx-auto mt-32 flex flex-col gap-6">
        <p className="text-xl md:text-2xl font-semibold text-gray-700">
          No worries! We'll send you an email to reset your password!
        </p>

        {/* Email */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">Email</label>
          <Field
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
          />
          {errors.email && (
            <span className="text-sm text-red-500 mt-1">{errors.email}</span>
          )}
        </div>

        {/* Submit */}
        <div className="mt-6 w-full flex justify-center">
          <PrimaryButton
            text="Send Reset Link"
            variant="primary"
            size="small"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
