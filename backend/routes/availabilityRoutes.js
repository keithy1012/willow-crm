import express from "express";
import {
  createRecurringAvailability,
  setDateAvailability,
  removeAvailabilityForDate,
  removeTimeSlot,
  getDoctorAvailabilityForDate,
  searchDoctorsByDateTime,
} from "../controllers/doctors/availabilityController.js";

const router = express.Router();

// Set availability
router.post("/doctor/:doctorId/recurring", createRecurringAvailability);
router.post("/doctor/:doctorId/date", setDateAvailability);

// Remove availability
router.delete("/doctor/:doctorId/date", removeAvailabilityForDate);
router.delete("/slot/:availabilityId/:slotIndex", removeTimeSlot);

// Get availability
router.get("/doctor/:doctorId", getDoctorAvailabilityForDate);

// Search
router.get("/search", searchDoctorsByDateTime);

export default router;
