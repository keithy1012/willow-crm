// routes/doctorRoutes.js
import express from "express";
import { authenticate } from "../../middleware/authentication.js";

import {
  getAllDoctors,
  getDoctorsBySpeciality,
  getDoctorByUserId,
} from "../../controllers/doctors/doctorController.js";

const router = express.Router();
router.get("/user/:userId", authenticate, getDoctorByUserId);

// Get all doctors
router.get("/", getAllDoctors);

// Get doctors for a speciality
router.get("/speciality/:speciality", getDoctorsBySpeciality);
router.get("/user/:userId", authenticate, getDoctorByUserId);

export default router;
