// routes/doctorRoutes.js

import express from "express";
import { protect } from "../middleware/authentication.js";
import {
  createDoctor,
  getAllDoctors,
  getDoctorsBySpeciality,
} from "../controllers/doctorController.js";

const router = express.Router();

// Creates a Doctor
router.post("/", createDoctor);

// Get all doctors (protected - requires authentication)
router.get("/", protect, getAllDoctors);

// Get doctors for a speciality (protected - requires authentication)
router.get("/speciality/:speciality", protect, getDoctorsBySpeciality);

export default router;
