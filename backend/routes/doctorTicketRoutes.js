// routes/doctorTicketRoutes.js

import express from "express";
import {
  submitDoctorTicket,
  getPendingTickets,
  approveTicket,
} from "../controllers/doctorTicketController.js";

const router = express.Router();

// Submit a new doctor request ticket (Doctor applicant)
router.post("/", submitDoctorTicket);

// Get all pending tickets (Ops team only)
router.get("/pending", getPendingTickets);

// Approve a doctor ticket (Ops team only)
router.post("/:ticketId/approve", approveTicket);

export default router;
