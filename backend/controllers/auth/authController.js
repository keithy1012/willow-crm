import User from "../../models/users/User.js";
import { generateResetToken, hashToken } from "../../utils/tokenUtils.js";
import { sendResetEmail } from "../../utils/emailService.js";
import { logEvent } from "../../utils/logger.js";

export const authController = {
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        logEvent("Auth", "Password reset failed - Email not provided");
        return res.status(400).json({ error: "Email is required." });
      }
      logEvent("Auth", `Password reset requested - Email: ${email}`);

      const user = await User.findOne({ email });

      if (!user) {
        logEvent(
          "Auth",
          `Password reset failed - User not found for email: ${email}`
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
        user._id
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
          user._id
        );
      } catch (emailError) {
        logEvent(
          "Email",
          `Password reset email failed - User: ${user._id}, Email: ${email}, Error: ${emailError.message}`,
          user._id
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
        `Password reset request error - Email: ${req.body?.email}, Error: ${err.message}`
      );
      res.status(500).json({ error: "Failed to process password reset." });
    }
  },

  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        logEvent(
          "Auth",
          "Password reset failed - Token or password not provided"
        );

        return res
          .status(400)
          .json({ error: "Token and new password are required." });
      }
      logEvent("Auth", "Password reset attempt initiated");

      // Hash incoming token the same way we stored it
      const hashedIncoming = hashToken(token);
      if (!hashedIncoming) {
        logEvent("Auth", "Password reset failed - Invalid token format");
        return res.status(400).json({ error: "Invalid token format." });
      }

      // Find user by hashed token and ensure token hasn't expired
      const user = await User.findOne({
        resetToken: hashedIncoming,
        resetTokenExpiry: { $gt: Date.now() },
      });

      if (!user) {
        logEvent("Auth", "Password reset failed - Invalid or expired token");
        return res.status(400).json({ error: "Invalid or expired token." });
      }
      logEvent(
        "Auth",
        `Password reset token validated - User: ${user._id}, Email: ${user.email}`,
        user._id
      );
      // Update password and clear reset token
      user.password = newPassword;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();
      logEvent(
        "Auth",
        `Password reset successful - User: ${user._id}, Email: ${user.email}`,
        user._id
      );

      res.json({ message: "Password reset successfully." });
    } catch (err) {
      logEvent("Auth", `Password reset error - Error: ${err.message}`);
      res.status(500).json({ error: "Failed to reset password." });
    }
  },
};
