import express from "express";
import { authenticate } from "../../middleware/authentication.js";
import {
  createRecurringAvailability,
  setDateAvailability,
  removeAvailabilityForDate,
  removeTimeSlot,
  getDoctorAvailabilityForDate,
  searchDoctorsByDateTime,
  getDoctorAllAvailabilities,
  getDoctorAvailabilityForDateRange,
} from "../../controllers/doctors/availabilityController.js";

const router = express.Router();

// Public routes
router.get("/doctor/:doctorId/all", getDoctorAllAvailabilities);
router.get("/doctor/:doctorId/range", getDoctorAvailabilityForDateRange);
router.get("/doctor/:doctorId", getDoctorAvailabilityForDate);
router.get("/search", searchDoctorsByDateTime);

// Protected routes (need authentication for writing)
router.post(
  "/doctor/:doctorId/recurring",
  authenticate,
  createRecurringAvailability
);
router.post("/doctor/:doctorId/date", authenticate, setDateAvailability);
router.post(
  "/doctor/:doctorId/remove-date",
  authenticate,
  removeAvailabilityForDate
);
router.delete("/:availabilityId/slot/:slotIndex", authenticate, removeTimeSlot);

export default router;
