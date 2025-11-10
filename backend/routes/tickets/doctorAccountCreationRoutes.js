// routes/doctorTicketRoutes.js
import express from "express";
import {
  submitDoctorTicket,
  getPendingTickets,
  approveTicket,
  getAllTicketsByID,
} from "../../controllers/tickets/doctorAccountCreationController.js";
import { requireRole } from "../../middleware/authMiddleware.js";
import { authenticate } from "../../middleware/authentication.js";

const router = express.Router();

// Submit a new doctor request ticket (Doctor applicant)
router.post("/", submitDoctorTicket);

// Get all pending tickets (Ops team only)
router.get("/pending", authenticate, requireRole(["Ops"]), getPendingTickets);

// Approve a doctor ticket (Ops team only)
router.patch(
  "/:ticketId/approve",
  authenticate,
  requireRole(["Ops"]),
  approveTicket
);

// Get all tickets completed by an Ops team member
router.get(
  "/completed/:userID",
  authenticate,
  requireRole(["Ops"]),
  getAllTicketsByID
);
export default router;
