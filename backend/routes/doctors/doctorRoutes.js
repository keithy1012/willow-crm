// routes/doctorRoutes.js
import express from "express";
import { authenticate } from "../../middleware/authentication.js";
import {
  getAllDoctors,
  getDoctorsBySpeciality,
  getDoctorByUserId,
} from "../../controllers/doctors/doctorController.js";

const router = express.Router();

// Public routes - anyone can view doctors list (for booking appointments)
router.get("/", getAllDoctors);
router.get("/speciality/:speciality", getDoctorsBySpeciality);

// Protected routes
router.get("/user/:userId", authenticate, getDoctorByUserId);

export default router;
