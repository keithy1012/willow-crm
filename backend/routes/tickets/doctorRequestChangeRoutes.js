// routes/doctorRequestChangeTicketRoutes.js
import express from "express";
import {
    createChangeTicket, 
    getPendingTickets,
    getTicketByID,
    getInProgressTicketsByOpsId,
    getAllTicketsByOpsId,
    startTicketProgress,
    completeTicket
} from "../../controllers/tickets/doctorRequestChangeController.js";
import { requireRole } from "../../middleware/authMiddleware.js";
import { authenticate } from "../../middleware/authentication.js";

const router = express.Router();

// Submit a doctor request change ticket
router.post("/", authenticate, requireRole(["Doctor"]), createChangeTicket);

// Get all pending tickets (Ops team only)
router.get("/pending", authenticate, requireRole(["Ops"]), getPendingTickets);

// Get a ticket by ID
router.get("/:id", authenticate, requireRole(["Ops"]), getTicketByID);

// Get all In Progress tickets by an Ops member ID
router.get("/:opsId/inprogress", authenticate, requireRole(["Ops"]), getInProgressTicketsByOpsId);

// Get all tickets by an Ops member ID
router.get("/:opsId/all", authenticate, requireRole(["Ops"]), getAllTicketsByOpsId);

// Moves a ticket from Pending to In Progress
router.patch("/:ticketId/start", authenticate, requireRole(["Ops"]), startTicketProgress);

// Moves a ticket from In Progress to Complete
router.patch("/:ticketId/complete", authenticate, requireRole(["Ops"]), completeTicket);

export default router;
