import express from "express";
import { authenticate } from "../../middleware/authentication.js";
import {
  bookAppointment,
  cancelAppointment,
  getDoctorAppointments,
  getPatientAppointments,
  updateAppointmentStatus,
  getAppointmentById,
  updateAppointmentDocuments,
  getAppointmentDocuments,
  notifyPatientOfDocument,
  downloadDocument,
  cancelAppointmentWithReason,
  markNoShowWithReason,
} from "../../controllers/appointments/appointmentController.js";
import { sendAppointmentConfirmation } from "../../utils/emailService.js";

const router = express.Router();

// Existing appointment routes
router.post("/book", authenticate, bookAppointment);
router.get("/:appointmentId", authenticate, getAppointmentById);
router.put("/:appointmentId/cancel", authenticate, cancelAppointment);
router.get("/doctor/:doctorId", authenticate, getDoctorAppointments);
router.get("/patient/:patientId", authenticate, getPatientAppointments);
router.put("/:appointmentId/status", authenticate, updateAppointmentStatus);

// Upload/update appointment documents (PDFs)
router.put(
  "/:appointmentId/documents",
  authenticate,
  updateAppointmentDocuments
);

router.post("/:appointmentId/cancel-with-reason", cancelAppointmentWithReason);
router.post("/:appointmentId/no-show-with-reason", markNoShowWithReason);

// Get appointment documents info
router.get("/:appointmentId/documents", authenticate, getAppointmentDocuments);

// Notify patient when document is uploaded
router.post(
  "/:appointmentId/notify-document",
  authenticate,
  notifyPatientOfDocument
);

// Download specific document
router.get(
  "/:appointmentId/documents/:documentType",
  authenticate,
  downloadDocument
);

// Test email endpoint (existing)
router.post("/test-email", async (req, res) => {
  try {
    const testData = {
      patientEmail: "young.lo@northeastern.edu",
      patientName: "Test Patient",
      doctorName: "Dr. Test Doctor",
      appointmentDate: new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      appointmentTime: "2:00 PM - 3:00 PM",
      appointmentId: "TEST-" + Date.now(),
      summary: "Test Appointment - Medical Consultation",
      notes: "This is a test appointment email",
      symptoms: ["fever", "nausea", "dizziness"],
    };

    const result = await sendAppointmentConfirmation(testData);

    res.json({
      success: true,
      message: "Test email sent successfully",
      messageId: result.messageId,
      accepted: result.accepted,
    });
  } catch (error) {
    console.error("Email test failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error,
    });
  }
});

export default router;
