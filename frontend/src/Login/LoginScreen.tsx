import React, { useState } from "react";
import Field from "../components/input/Field";
import PrimaryButton from "../components/buttons/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const TopRightBlob = "/onboarding_blob_top_right.svg";
const BottomLeftBlob = "/onboarding_blob_bottom_left.svg";

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validate = () => {
    const errs: { email?: string; password?: string } = {};

    if (!email) {
      errs.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errs.email = "Enter a valid email";
    }

    if (!password) {
      errs.password = "Password is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const res = await fetch("http://localhost:5050/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle backend error messages
        setErrors({ password: data.error || "Invalid credentials" });
        return;
      }

      // Store token and user data using AuthContext
      login(data.token, data.user);

      // Navigate after successful login based on role
      if (data.user.role === "Ops") {
        navigate("/opsdashboard/doctors");
      } else if (data.user.role === "Finance") {
        navigate("/financedashboard");
      } else if (data.user.role === "IT") {
        navigate("/itdashboard/pending");
      } else if (data.user.role === "Patient") {
        navigate("/patientdashboard");
      } else if (data.user.role === "Doctor") {
        navigate("/doctordashboard");
      } else {
        navigate("/error");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrors({ password: "Something went wrong. Please try again." });
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgotpassword");
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
          Welcome back!
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

        {/* Password */}
        <div className="flex flex-col">
          <label className="text-gray-600 mb-2">Password</label>
          <Field
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
          />
          {errors.password && (
            <span className="text-sm text-red-500 mt-1">{errors.password}</span>
          )}
        </div>

        {/* Forgot Password */}
        <button
          onClick={handleForgotPassword}
          className="text-sm text-blue-600 hover:underline self-end"
        >
          Forgot password?
        </button>

        {/* Submit */}
        <div className="mt-6 w-full flex justify-center">
          <PrimaryButton
            text="Login"
            variant="primary"
            size="small"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
