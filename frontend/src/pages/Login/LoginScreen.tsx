import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Field from "../../components/input/Field";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../api";

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      const user = { ...response.user, userID: response.user._id };
      login(response.token, user);

      const roleRoutes: Record<string, string> = {
        Ops: "/opsdashboard/doctors",
        Finance: "/invoices",
        IT: "/itdashboard",
        Patient: "/patientdashboard",
        Doctor: "/doctordashboard",
      };

      navigate(roleRoutes[user.role] || "/error");
    } catch (error: any) {
      setErrors({ password: error.message || "Invalid credentials" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => navigate("/forgotpassword");

  return (
    <div className="relative w-full min-h-screen bg-white flex flex-col p-8 overflow-hidden">
      <img
        src="/onboarding_blob_top_right.svg"
        alt=""
        className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96"
      />
      <img
        src="/onboarding_blob_bottom_left.svg"
        alt=""
        className="absolute bottom-0 left-[-15px] w-64 h-64 md:w-96 md:h-96"
      />

      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 absolute top-8 left-8 z-10">
        Willow CRM
      </h1>

      <div className="z-10 w-full max-w-lg mx-auto mt-32 flex flex-col gap-6">
        <p className="text-xl md:text-2xl font-semibold text-gray-700">
          Welcome back!
        </p>

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

        <button
          onClick={handleForgotPassword}
          className="text-sm text-blue-600 hover:underline self-end"
        >
          Forgot password?
        </button>

        <div className="mt-6 w-full flex justify-center">
          <PrimaryButton
            text={isLoading ? "Logging in..." : "Login"}
            variant="primary"
            size="small"
            onClick={handleSubmit}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
