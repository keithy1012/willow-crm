import crypto from "crypto";

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const verifyResetToken = (token) => {
  // Basic validation - in production, consider JWT or more robust methods
  if (!token || typeof token !== "string" || token.length !== 64) {
    return null;
  }
  return token;
};
