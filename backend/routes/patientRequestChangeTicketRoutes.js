// routes/patientRequestChangeTicketRoutes.js
import express from "express";
import {
    createChangeTicket, 
    getPendingTickets,
    getTicketByID,
    getInProgressTicketsByOpsId,
    getAllTicketsByOpsId,
    startTicketProgress,
    completeTicket

} from "../controllers/patientRequestChangeTicketController.js";
import { requireRole } from "../middleware/authMiddleware.js";


const router = express.Router();

// Submit a patient request change ticket
router.post("/", requireRole(["Patient"]), createChangeTicket);

// Get all pending tickets (Ops team only)
router.get("/pending", requireRole(["Ops"]), getPendingTickets);

// Get a ticket by ID
router.get("/patientTicket/:id", requireRole(["Ops"]), getTicketByID);

// Get all In Progress tickets by an Ops member ID
router.get("/in-progress/:opsId", requireRole(["Ops"]), getInProgressTicketsByOpsId);

// Get all tickets by an Ops member ID
router.get("/all/:opsId", requireRole(["Ops"]), getAllTicketsByOpsId);

// Moves a ticket from Pending to In Progress
router.post("/:ticketId/start", requireRole(["Ops"]), startTicketProgress);

// Moves a ticket from In Progress to Complete
router.post("/:ticketId/complete", requireRole(["Ops"]), completeTicket);

export default router;
