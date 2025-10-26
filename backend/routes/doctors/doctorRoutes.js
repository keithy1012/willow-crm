// routes/doctorRoutes.js
import express from "express";
import {
  getAllDoctors,
  getDoctorsBySpeciality,
} from "../../controllers/doctors/doctorController.js";

const router = express.Router();

// Get all doctors
router.get("/", getAllDoctors);

// Get doctors for a speciality
router.get("/speciality/:speciality", getDoctorsBySpeciality);

export default router;
