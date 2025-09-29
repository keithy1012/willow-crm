import express from "express";
import { createPatient } from "../controllers/patientController.js";

const router = express.Router();

router.post("/", createPatient);

export default router;