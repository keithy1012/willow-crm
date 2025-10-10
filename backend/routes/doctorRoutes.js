// routes/doctorRoutes.js

import express from "express";
import {
  createDoctor,
  getAllDoctors,
  getDoctorsBySpeciality,
} from "../controllers/doctorController.js";

const router = express.Router();

// Creates a Doctor
router.post("/", createDoctor);

// Get all doctors
router.get("/", getAllDoctors);

// Get doctors for a speciality
router.get("/speciality/:speciality", getDoctorsBySpeciality);

export default router;
