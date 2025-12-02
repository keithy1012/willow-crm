import nodemailer from "nodemailer";

import dotenv from "dotenv";

dotenv.config();

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      port: 587,
      host: "smtp.gmail.com",
      secure: false,
    });
  }
  return transporter;
};

// Generic send email function
export const sendEmail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: {
      name: "Willow CRM",
      address: process.env.EMAIL_USER,
    },
    to: to,
    subject: subject,
    html: html,
    text: text || "Please view this email in an HTML-capable email client.",
  };
  try {
    const info = await getTransporter().sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const sendResetEmail = async (email, resetUrl, firstName) => {
  const emailHTML = `
        <h2>Password Reset Request</h2>
        <p>Hi ${firstName},</p>
        <p>We received a request to reset your password. Click the link below to proceed:</p>
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Willow CRM Team</p>
      `;

  return sendEmail({
    to: email,
    subject: `Password Reset Request - Willow CRM`,
    html: emailHTML,
  });
};

// Document notification email
export const sendDocumentNotification = async ({
  patientEmail,
  patientName,
  doctorName,
  appointmentDate,
  appointmentId,
  documentType,
}) => {
  const subject = `New ${
    documentType === "afterVisitSummary"
      ? "After Visit Summary"
      : "Notes and Instructions"
  } Available`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Document Available</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${
            documentType === "afterVisitSummary"
              ? "Your after visit summary is ready"
              : "New notes and instructions from your care team"
          }</p>
        </div>
        
        <div class="content">
          <p>Dear ${patientName},</p>
          <p>${doctorName} has uploaded ${
    documentType === "afterVisitSummary"
      ? "an after visit summary"
      : "notes and instructions"
  } for your appointment on ${appointmentDate}.</p>
          
          <p>You can view and download this document by logging into your patient portal.</p>
          
          <center>
            <a href="${
              process.env.APP_URL || "http://localhost:3000"
            }/appointment/${appointmentId}" class="button">View Document</a>
          </center>
          
          <p>If you have any questions, please don't hesitate to contact our office.</p>
          
          <p>Best regards,<br>
          Willow CRM Medical Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
          <p>© 2025 Willow CRM. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Dear ${patientName},
    
    ${doctorName} has uploaded ${
    documentType === "afterVisitSummary"
      ? "an after visit summary"
      : "notes and instructions"
  } for your appointment on ${appointmentDate}.
    
    You can view and download this document by logging into your patient portal.
    
    Best regards,
    Willow CRM Medical Team
  `;

  return sendEmail({ to: patientEmail, subject, html, text });
};

// Send appointment confirmation email
export const sendAppointmentConfirmation = async ({
  patientEmail,
  patientName,
  doctorName,
  appointmentDate,
  appointmentTime,
  appointmentId,
  summary,
  notes,
  symptoms,
}) => {
  const symptomsList =
    symptoms && symptoms.length > 0
      ? symptoms.map((s) => `<li>${s}</li>`).join("")
      : "<li>None specified</li>";

  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .appointment-card { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #eee; }
        .info-label { font-weight: bold; width: 150px; color: #666; }
        .info-value { flex: 1; color: #333; }
        .symptoms-list { margin: 10px 0; padding-left: 20px; }
        .notes-section { background: #f0f7ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Appointment Confirmation</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your appointment has been successfully booked</p>
        </div>
        
        <div class="content">
          <p>Dear ${patientName},</p>
          <p>Your appointment has been confirmed with the following details:</p>
          
          <div class="appointment-card">
            <div class="info-row">
              <div class="info-label">Confirmation ID:</div>
              <div class="info-value"><strong>${appointmentId}</strong></div>
            </div>
            <div class="info-row">
              <div class="info-label">Doctor:</div>
              <div class="info-value">${doctorName}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Date:</div>
              <div class="info-value">${appointmentDate}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Time:</div>
              <div class="info-value">${appointmentTime}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Reason for Visit:</div>
              <div class="info-value">${summary}</div>
            </div>
            ${
              symptoms && symptoms.length > 0
                ? `
            <div class="info-row">
              <div class="info-label">Symptoms:</div>
              <div class="info-value">
                <ul class="symptoms-list">
                  ${symptomsList}
                </ul>
              </div>
            </div>
            `
                : ""
            }
          </div>

          ${
            notes
              ? `
          <div class="notes-section">
            <h3 style="margin-top: 0;">Additional Notes:</h3>
            <p>${notes}</p>
          </div>
          `
              : ""
          }

          <div class="warning">
            <strong>Important Reminders:</strong>
            <ul style="margin: 10px 0;">
              <li>Please arrive 15 minutes early to complete any necessary paperwork</li>
              <li>Bring your insurance card and a valid ID</li>
              <li>Bring a list of current medications</li>
              <li>If you need to cancel or reschedule, please do so at least 24 hours in advance</li>
            </ul>
          </div>

          <center>
            <a href="${
              process.env.APP_URL
            }/appointments" class="button">View My Appointments</a>
          </center>

          <p>If you have any questions or need to make changes to your appointment, please contact us as soon as possible.</p>
          
          <p>Best regards,<br>
          Willow CRM Medical Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
          <p>© 2025 Willow CRM. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: patientEmail,
    subject: `Appointment Confirmation - Willow CRM`,
    html: emailHTML,
    text: `
      Appointment Confirmation
      
      Dear ${patientName},
      
      Your appointment has been confirmed with the following details:
      
      Confirmation ID: ${appointmentId}
      Doctor: ${doctorName}
      Date: ${appointmentDate}
      Time: ${appointmentTime}
      Reason for Visit: ${summary}
      
      Important Reminders:
      - Please arrive 15 minutes early
      - Bring your insurance card and ID
      - Bring a list of current medications
      - Cancel at least 24 hours in advance if needed
      
      Best regards,
      Willow CRM Medical Team
    `,
  });
};

// Send appointment cancellation email
export const sendAppointmentCancellation = async ({
  patientEmail,
  patientName,
  doctorName,
  appointmentDate,
  appointmentTime,
  appointmentId,
  reason,
}) => {
  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-card { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #dc3545; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Appointment Cancelled</h1>
        </div>
        
        <div class="content">
          <p>Dear ${patientName},</p>
          <p>Your appointment has been cancelled:</p>
          
          <div class="info-card">
            <p><strong>Appointment ID:</strong> ${appointmentId}</p>
            <p><strong>Doctor:</strong> ${doctorName}</p>
            <p><strong>Original Date:</strong> ${appointmentDate}</p>
            <p><strong>Original Time:</strong> ${appointmentTime}</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          </div>

          <p>If you would like to reschedule, please book a new appointment through our system.</p>
          
          <center>
            <a href="${
              process.env.APP_URL
            }/search" class="button">Book New Appointment</a>
          </center>
          
          <p>Best regards,<br>
          Willow CRM Medical Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: patientEmail,
    subject: `Appointment Cancellation - Willow CRM`,
    html: emailHTML,
  });
};
