import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: "willowcrm225@gmail.com",
    pass: "xaah vxsa inqo fwfn", //process.env.EMAIL_PASSWORD,
  },
  port: 587,
  host: "smtp.gmail.com",
  secure: false,
});

export const sendResetEmail = async (email, resetUrl, firstName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request - Willow CRM",
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${firstName},</p>
        <p>We received a request to reset your password. Click the link below to proceed:</p>
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Willow CRM Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Email send error:", err);
    throw new Error("Failed to send email");
  }
};
