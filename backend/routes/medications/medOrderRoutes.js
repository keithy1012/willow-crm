import express from "express";
import {
  createMedorder,
  getMedordersByPatient,
  getMedordersByDoctor,
  getMedorderById,
  updateMedorder,
  processRefill,
  deleteMedorder,
  sendRefillRequest,
} from "../../controllers/medications/medOrderController.js";

const router = express.Router();

// Create a new medication order
router.post("/", createMedorder);

// Send refill request email
router.post("/refill-request", sendRefillRequest);

// Get all medication orders for a specific patient
router.get("/patient/:patientID", getMedordersByPatient);

// Get all medication orders prescribed by a specific doctor
router.get("/doctor/:doctorID", getMedordersByDoctor);

// Get a single medication order by orderID
router.get("/:orderID", getMedorderById);

// Update a medication order
router.put("/:orderID", updateMedorder);

// Process a refill for a medication order
router.post("/:orderID/refill", processRefill);

// Delete a medication order
router.delete("/:orderID", deleteMedorder);

export default router;
