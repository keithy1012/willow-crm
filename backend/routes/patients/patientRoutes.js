import express from "express";
import { authenticate } from "../../middleware/authentication.js";
import {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getInsuranceCards,
  searchPatientsByName,
  getPatientByPatientId,
} from "../../controllers/patients/patientController.js";

const router = express.Router();

// Creates a new patient
router.post("/", createPatient);

// Apply authenticate middleware to all routes
router.use(authenticate);

// Gets all patients in the system
router.get("/", getAllPatients);

// IMPORTANT: Search route must come BEFORE /:id route
router.get("/search", searchPatientsByName);

// Gets insurance card images by ID
router.get("/:id/insuranceCards", getInsuranceCards);

// Gets a patient by user ID
router.get("/:id", getPatientById);

// Updates a patient by user ID
router.put("/:id", updatePatient);

// Deletes a patient by user ID
router.delete("/:id", deletePatient);

// Gets a patient by patient ID (not user ID)
router.get("/patient/:id", getPatientByPatientId);

export default router;
