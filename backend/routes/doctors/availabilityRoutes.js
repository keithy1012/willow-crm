import express from "express";
import { authenticate } from "../../middleware/authentication.js";
import {
  createRecurringAvailability,
  setDateAvailability,
  removeAvailabilityForDate,
  removeTimeSlot,
  getDoctorAvailabilityForDate,
  searchDoctorsByDateTime,
} from "../../controllers/doctors/availabilityController.js";

const router = express.Router();

// Set availability (protected routes)
router.post(
  "/doctor/:doctorId/recurring",
  authenticate,
  createRecurringAvailability
);
router.post("/doctor/:doctorId/date", authenticate, setDateAvailability);

// Remove availability
router.delete(
  "/doctor/:doctorId/date",
  authenticate,
  removeAvailabilityForDate
);
router.delete("/slot/:availabilityId/:slotIndex", authenticate, removeTimeSlot);

// Get availability
router.get("/doctor/:doctorId", getDoctorAvailabilityForDate);

// Search
router.get("/search", searchDoctorsByDateTime);

export default router;
