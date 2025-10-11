// routes/patientRoutes.js
import express from "express";
<<<<<<< HEAD
=======
import { protect } from "../middleware/authentication.js";
>>>>>>> 01638b4 (patient routes oops)
import {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from "../controllers/patientController.js";

const router = express.Router();

router.post("/", createPatient);
<<<<<<< HEAD
router.get("/", getAllPatients);
router.get("/:id", getPatientById);
router.put("/:id", updatePatient);
router.delete("/:id", deletePatient);
=======
router.get("/", protect, getAllPatients);
router.get("/:id", protect, getPatientById);
router.put("/:id", protect, updatePatient);
router.delete("/:id", protect, deletePatient);
>>>>>>> 01638b4 (patient routes oops)

export default router;
