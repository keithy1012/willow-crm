// routes/doctorTicketRoutes.js
import express from "express";
import {
  submitDoctorTicket,
  getPendingTickets,
  approveTicket,
} from "../controllers/doctorTicketController.js";
import { requireRole } from "../middleware/authorization.js";


const router = express.Router();

// Submit a new doctor request ticket (Doctor applicant)
router.post("/", requireRole(["Doctor"]), submitDoctorTicket);

// Get all pending tickets (Ops team only)
router.get("/pending", requireRole(["Ops"]), getPendingTickets);

// Approve a doctor ticket (Ops team only)
router.post("/:ticketId/approve", requireRole(["Ops"]), approveTicket);

export default router;
