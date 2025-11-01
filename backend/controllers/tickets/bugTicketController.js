import mongoose from "mongoose";
import BugTicket from "../../models/tickets/BugTicket.js";

// Create new generic ticket
export const createTicket = async (req, res) => {
  try {
    const ticket = new BugTicket({
      submitter: req.user._id,
      status: "Pending",
      ...req.body,
    });
    await ticket.save();
    res.status(201).json({ message: "Ticket submitted successfully", ticket });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all pending tickets
export const getPendingTickets = async (req, res) => {
  try {
    const tickets = await BugTicket.find({ status: "Pending" });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a specific ticket by ID
export const getTicketByID = async (req, res) => {
  try {
    const ticket = await BugTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    return res.json(ticket);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get all In Progress tickets assigned to a specific Ops member
export const getInProgressTicketsByOpsId = async (req, res) => {
  try {
    const opsId = new mongoose.Types.ObjectId(req.params.opsId);
    const tickets = await BugTicket.find({
      assignedTo: opsId,
      status: "In Progress",
    });
    if (!tickets || tickets.length === 0)
      return res.status(404).json({ error: "No tickets found" });
    return res.json(tickets);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get all tickets (any status) assigned to a specific Ops member
export const getAllTicketsByOpsId = async (req, res) => {
  try {
    const opsId = new mongoose.Types.ObjectId(req.params.opsId);
    const tickets = await BugTicket.find({ assignedTo: opsId });
    if (!tickets || tickets.length === 0)
      return res.status(404).json({ error: "No tickets found" });
    return res.json(tickets);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Move a pending ticket into "In Progress"
export const startTicketProgress = async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const ticket = await BugTicket.findOne({
      _id: ticketId,
      status: "Pending",
    });
    if (!ticket) {
      return res
        .status(404)
        .json({ error: "Pending ticket not found or already in progress." });
    }
    ticket.status = "In Progress";
    ticket.assignedTo = req.user._id;
    await ticket.save();
    res.json({
      message: "Ticket moved to In Progress",
      ticket,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Move an In Progress ticket to Completed
export const completeTicket = async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const ticket = await BugTicket.findOne({
      _id: ticketId,
      status: "In Progress",
    });
    if (!ticket) {
      return res
        .status(404)
        .json({ error: "Ticket not found or not in progress." });
    }
    ticket.status = "Completed";
    ticket.approvedBy = req.user._id;
    ticket.dateCompleted = new Date();
    await ticket.save();
    res.json({
      message: "Ticket marked as Completed",
      ticket,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
