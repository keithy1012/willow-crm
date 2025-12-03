import User from "../../models/users/User.js";
import { generateResetToken, hashToken } from "../../utils/tokenUtils.js";
import { sendResetEmail } from "../../utils/emailService.js";
import { logEvent, getClientIp } from "../../utils/logger.js";

export const authController = {
  async requestPasswordReset(req, res) {
    const ip = getClientIp(req);
    try {
      const { email } = req.body;

      if (!email) {
        logEvent(
          "Auth",
          "Password reset failed - Email not provided",
          "N/A",
          ip
        );
        return res.status(400).json({ error: "Email is required." });
      }
      logEvent("Auth", `Password reset requested - Email: ${email}`, "N/A", ip);

      const user = await User.findOne({ email });

      if (!user) {
        logEvent(
          "Auth",
          `Password reset failed - User not found for email: ${email}`,
          "N/A",
          ip
        );

        return res.json({
          message: "This user does not exist.",
        });
      }

      const { raw: rawToken, hash: hashedToken } = generateResetToken();
      const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000);

      // Save hashed token to user
      user.resetToken = hashedToken;
      user.resetTokenExpiry = resetTokenExpiry;
      await user.save();
      logEvent(
        "Auth",
        `Reset token generated - User: ${
          user._id
        }, Email: ${email}, Expires: ${resetTokenExpiry.toISOString()}`,
        user._id,
        ip
      );

      // Send reset email with raw token
      const resetUrl = `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/reset-password/${rawToken}`;

      try {
        await sendResetEmail(user.email, resetUrl, user.firstName);
        logEvent(
          "Email",
          `Password reset email sent - User: ${user._id}, Email: ${email}`,
          user._id,
          ip
        );
      } catch (emailError) {
        logEvent(
          "Email",
          `Password reset email failed - User: ${user._id}, Email: ${email}, Error: ${emailError.message}`,
          user._id,
          ip
        );
        // Don't throw - still return success for security
      }
      res.json({
        message:
          "If an account exists for this email, a reset link has been sent.",
      });
    } catch (err) {
      logEvent(
        "Auth",
        `Password reset request error - Email: ${req.body?.email}, Error: ${err.message}`,
        "N/A",
        ip
      );
      res.status(500).json({ error: "Failed to process password reset." });
    }
  },

  async resetPassword(req, res) {
    const ip = getClientIp(req);
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        logEvent(
          "Auth",
          "Password reset failed - Token or password not provided",
          "N/A",
          ip
        );

        return res
          .status(400)
          .json({ error: "Token and new password are required." });
      }
      logEvent("Auth", "Password reset attempt initiated", "N/A", ip);

      // Hash incoming token the same way we stored it
      const hashedIncoming = hashToken(token);
      if (!hashedIncoming) {
        logEvent(
          "Auth",
          "Password reset failed - Invalid token format",
          "N/A",
          ip
        );
        return res.status(400).json({ error: "Invalid token format." });
      }

      // Find user by hashed token and ensure token hasn't expired
      const user = await User.findOne({
        resetToken: hashedIncoming,
        resetTokenExpiry: { $gt: Date.now() },
      });

      if (!user) {
        logEvent(
          "Auth",
          "Password reset failed - Invalid or expired token",
          "N/A",
          ip
        );
        return res.status(400).json({ error: "Invalid or expired token." });
      }
      logEvent(
        "Auth",
        `Password reset token validated - User: ${user._id}, Email: ${user.email}`,
        user._id,
        ip
      );
      // Update password and clear reset token
      user.password = newPassword;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();
      logEvent(
        "Auth",
        `Password reset successful - User: ${user._id}, Email: ${user.email}`,
        user._id,
        ip
      );

      res.json({ message: "Password reset successfully." });
    } catch (err) {
      logEvent(
        "Auth",
        `Password reset error - Error: ${err.message}`,
        "N/A",
        ip
      );
      res.status(500).json({ error: "Failed to reset password." });
    }
  },
};
