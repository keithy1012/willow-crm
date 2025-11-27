import crypto from "crypto";

/**
 * generateResetToken()
 * - returns { raw, hash } where `raw` is sent to the user and `hash` is stored in DB.
 */
export const generateResetToken = () => {
  const raw = crypto.randomBytes(32).toString("hex"); // 64 chars
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
};

/**
 * hashToken(token)
 * - helper to hash an incoming token string using same algorithm.
 */
export const hashToken = (token) => {
  if (!token || typeof token !== "string") return null;
  return crypto.createHash("sha256").update(token).digest("hex");
};
