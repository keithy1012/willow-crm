// routes/patientRoutes.js
import express from "express";
import {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from "../../controllers/patients/patientController.js"

const router = express.Router();

// Creates a new patient
router.post("/", createPatient);

// Gets all patients in the system
router.get("/", getAllPatients);

// Gets a patient by a specific ID
router.get("/:id", getPatientById);

// Updates a patient by a specific ID
router.put("/:id", updatePatient);

// Deletes a patient by a delete ID
router.delete("/:id", deletePatient);

export default router;
