import express from "express";
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

// Gets all patients in the system
router.get("/", getAllPatients);

// IMPORTANT: Search route must come BEFORE /:id route
router.get("/search", searchPatientsByName);

// Gets insurance card images by ID
router.get("/:id/insuranceCards", getInsuranceCards);

// Gets a patient by a specific ID
router.get("/:id", getPatientById);

// Updates a patient by a specific ID
router.put("/:id", updatePatient);

// Deletes a patient by a delete ID
router.delete("/:id", deletePatient);

// Gets a patient's insurance cards
router.get("/getInsurance/:id", getInsuranceCards);

router.get("/patient/:id", getPatientByPatientId);

export default router;
