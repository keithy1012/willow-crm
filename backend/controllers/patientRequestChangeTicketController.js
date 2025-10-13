// controllers/patientRequestChangeTicketController.js
import PatientRequestTicket from "../models/PatientRequestTicket.js"

// Create new patient request change ticket
export const createChangeTicket = async (req, res) => {
  try {
    const ticket = new PatientRequestTicket({
      requestedBy: req.user._id,
      ...req.body,
    });
    await ticket.save();
    res.status(201).json({ message: "Ticket submitted successfully", ticket });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Gets all pending patient change request tickets
export const getPendingTickets = async (req, res) => {
  try {
    const tickets = await PatientRequestTicket.find({ status: "Pending" });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a specific ticket by id
export const getTicketByID = async (req, res) => {
  try {
    const ticket = await PatientRequestTicket.findOne({ _id: req.params.ticketId });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    return res.json(ticket);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get all tickets in Progress by a Ops member by id
export const getInProgressTicketsByOpsId = async (req, res) => {
  try {
    const tickets = await PatientRequestTicket.find({ responsibleMember: req.params.opsId, status:"In Progress" });
    if (!tickets) return res.status(404).json({ error: "Tickets not found" });
    return res.json(tickets);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get all tickets (disregard status) by a Ops member by id 
export const getAllTicketsByOpsId = async (req, res) => {
  try {
    const tickets = await PatientRequestTicket.find({ responsibleMember: req.params.opsId });
    if (!tickets) return res.status(404).json({ error: "Tickets not found" });
    return res.json(tickets);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Move a pending ticket into In Progress
    // Update status in ticket
    // Changes responsibleMember to the Ops User's id
export const startTicketProgress = async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const ticket = await PatientRequestTicket.findOne({ _id: ticketId, status: "Pending" });
    if (!ticket) {
      return res.status(404).json({ error: "Pending ticket not found or already in progress." });
    }
    // Update status and assign Ops member
    ticket.status = "In Progress";
    ticket.responsibleMember = req.user._id; 
    await ticket.save();

    res.json({
      message: "Ticket moved to In Progress",
      ticket,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Move a In Progress ticket to Completed
    // Update status in ticket
    // Update approved by the Ops User's id
    // Update date completed
export const completeTicket = async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const ticket = await PatientRequestTicket.findOne({ _id: ticketId, status: "In Progress" });
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found or not in progress." });
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
