// routes/doctorTicketRoutes.js
import express from "express";
import {
  submitDoctorTicket,
  getPendingTickets,
  approveTicket,
  getAllTicketsByID
} from "../controllers/doctorAccountCreationTicketController.js";
import { requireRole } from "../middleware/authMiddleware.js";


const router = express.Router();

// Submit a new doctor request ticket (Doctor applicant)
router.post("/", submitDoctorTicket);

// Get all pending tickets (Ops team only)
router.get("/pending", requireRole(["Ops"]), getPendingTickets);

// Approve a doctor ticket (Ops team only)
router.post("/:ticketId/approve", requireRole(["Ops"]), approveTicket);

// Get all tickets completed by an Ops team member
router.post("/completed/:userID", requireRole(["Ops"]), getAllTicketsByID);
export default router;
