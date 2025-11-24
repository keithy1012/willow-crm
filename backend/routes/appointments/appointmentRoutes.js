import express from "express";
import { authenticate } from "../../middleware/authentication.js";
import {
  bookAppointment,
  cancelAppointment,
  getDoctorAppointments,
  getPatientAppointments,
  updateAppointmentStatus,
} from "../../controllers/appointments/appointmentController.js";

const router = express.Router();

// Book appointment
router.post("/book", authenticate, bookAppointment);

// Cancel appointment
router.put("/:appointmentId/cancel", authenticate, cancelAppointment);

// Get doctor's appointments
router.get("/doctor/:doctorId", authenticate, getDoctorAppointments);

// Get patient's appointments
router.get("/patient/:patientId", authenticate, getPatientAppointments);

// Update appointment status
router.put("/:appointmentId/status", authenticate, updateAppointmentStatus);

export default router;
