import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PrimaryButton from "../../components/buttons/PrimaryButton";

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirm?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!token) {
      setMessage({ type: "error", text: "Invalid or missing reset token." });
    }
  }, [token]);

  const validate = () => {
    const errs: { newPassword?: string; confirm?: string } = {};
    if (!newPassword) errs.newPassword = "Enter a new password.";
    else if (newPassword.length < 8)
      errs.newPassword = "Password must be at least 8 characters.";
    if (confirmPassword !== newPassword)
      errs.confirm = "Passwords do not match.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!token) {
      setMessage({ type: "error", text: "Invalid or missing reset token." });
      return;
    }
    if (!validate()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "Failed to reset password.",
        });
      } else {
        setMessage({
          type: "success",
          text: data.message || "Password reset successfully.",
        });
        setTimeout(() => navigate("/login"), 1800);
      }
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "Unexpected error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md bg-white border rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Reset Password</h2>

        {!token ? (
          <div className="text-sm text-red-600 mb-4">
            Invalid or missing reset token. Please use the link from your email.
          </div>
        ) : (
          <>
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded p-2 mb-2"
              placeholder="Enter new password"
            />
            {errors.newPassword && (
              <div className="text-sm text-red-600 mb-2">
                {errors.newPassword}
              </div>
            )}

            <label className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded p-2 mb-2"
              placeholder="Confirm new password"
            />
            {errors.confirm && (
              <div className="text-sm text-red-600 mb-2">{errors.confirm}</div>
            )}

            <div className="mt-4">
              <PrimaryButton
                text={isLoading ? "Saving..." : "Save new password"}
                onClick={handleSubmit}
                variant="primary"
                size="small"
                disabled={isLoading}
              />
            </div>
          </>
        )}

        {message && (
          <div
            className={`mt-4 p-3 rounded text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
