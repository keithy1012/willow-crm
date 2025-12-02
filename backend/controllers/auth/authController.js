import User from "../../models/users/User.js";
import { generateResetToken, hashToken } from "../../utils/tokenUtils.js";
import { sendResetEmail } from "../../utils/emailService.js";

export const authController = {
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required." });
      }

      // Find user by email
      const user = await User.findOne({ email });

      if (!user) {
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

      // Send reset email with raw token
      const resetUrl = `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/reset-password/${rawToken}`;

      await sendResetEmail(user.email, resetUrl, user.firstName);

      res.json({
        message:
          "If an account exists for this email, a reset link has been sent.",
      });
    } catch (err) {
      console.error("Request reset error:", err);
      res.status(500).json({ error: "Failed to process password reset." });
    }
  },

  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res
          .status(400)
          .json({ error: "Token and new password are required." });
      }
      // Hash incoming token the same way we stored it
      const hashedIncoming = hashToken(token);
      if (!hashedIncoming) {
        return res.status(400).json({ error: "Invalid token format." });
      }

      // Find user by hashed token and ensure token hasn't expired
      const user = await User.findOne({
        resetToken: hashedIncoming,
        resetTokenExpiry: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ error: "Invalid or expired token." });
      }

      // Update password and clear reset token
      user.password = newPassword;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();

      res.json({ message: "Password reset successfully." });
    } catch (err) {
      console.error("Reset password error:", err);
      res.status(500).json({ error: "Failed to reset password." });
    }
  },
};
