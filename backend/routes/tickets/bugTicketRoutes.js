import express from "express";
import {
  createTicket,
  getPendingTickets,
  getTicketByID,
  getInProgressTicketsByItId,
  getAllTicketsByItId,
  startTicketProgress,
  completeTicket,
} from "../../controllers/tickets/bugTicketController.js";
import { requireRole } from "../../middleware/authMiddleware.js";
import { authenticate } from "../../middleware/authentication.js";

const router = express.Router();

// Submit a new general ticket
router.post("/", authenticate, createTicket);

// Get all pending tickets (IT team only)
router.get("/pending", authenticate, requireRole(["IT"]), getPendingTickets);

// Get a ticket by ID (IT team only)
router.get("/:id", authenticate, requireRole(["IT"]), getTicketByID);

// Get all In Progress tickets by an IT member ID
router.get(
  "/:itId/inprogress",
  authenticate,
  requireRole(["IT"]),
  getInProgressTicketsByItId
);

// Get all tickets by an IT member ID
router.get(
  "/:itId/all",
  authenticate,
  requireRole(["IT"]),
  getAllTicketsByItId
);

// Move a ticket from Pending → In Progress
router.patch(
  "/:ticketId/start",
  authenticate,
  requireRole(["IT"]),
  startTicketProgress
);

// Move a ticket from In Progress → Completed
router.patch(
  "/:ticketId/complete",
  authenticate,
  requireRole(["IT"]),
  completeTicket
);

export default router;
