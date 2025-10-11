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
} from "../controllers/doctorRequestChangeTicketController.js";
import { requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Submit a doctor request change ticket
router.post("/", requireRole(["Doctor"]), createChangeTicket);

// Get all pending tickets (Ops team only)
router.get("/pending", requireRole(["Ops"]), getPendingTickets);

// Get a ticket by ID
router.get("/:id", requireRole(["Ops"]), getTicketByID);

// Get all In Progress tickets by an Ops member ID
router.get("/in-progress/:opsId", requireRole(["Ops"]), getInProgressTicketsByOpsId);

// Get all tickets by an Ops member ID
router.get("/all/:opsId", requireRole(["Ops"]), getAllTicketsByOpsId);

// Moves a ticket from Pending to In Progress
router.post("/:ticketId/start", requireRole(["Ops"]), startTicketProgress);

// Moves a ticket from In Progress to Complete
router.post("/:ticketId/complete", requireRole(["Ops"]), completeTicket);

export default router;
