import mongoose from "mongoose";
import DoctorRequestTicket from "../../models/tickets/DoctorRequestTicket.js";
import { logEvent } from "../../utils/logger.js";

// Create new doctor request change ticket
export const createChangeTicket = async (req, res) => {
  try {
    logEvent(
      "DoctorRequestTicket",
      `Create change ticket initiated - Requested By: ${req.user._id}, Type: ${
        req.body.requestType || "N/A"
      }`,
      req.user?._id
    );

    const ticket = new DoctorRequestTicket({
      requestedBy: req.user._id,
      ...req.body,
    });
    await ticket.save();

    logEvent(
      "DoctorRequestTicket",
      `Change ticket created successfully - Ticket ID: ${ticket._id}, Requested By: ${req.user._id}, Status: Pending`,
      req.user?._id
    );

    res.status(201).json({ message: "Ticket submitted successfully", ticket });
  } catch (err) {
    logEvent(
      "DoctorRequestTicket",
      `Create change ticket error - Requested By: ${req.user?._id}, Error: ${err.message}`,
      req.user?._id
    );
    res.status(400).json({ error: err.message });
  }
};

// Gets all pending doctor change request tickets
export const getPendingTickets = async (req, res) => {
  try {
    logEvent(
      "DoctorRequestTicket",
      "Get pending change tickets initiated",
      req.user?._id
    );

    const tickets = await DoctorRequestTicket.find({ status: "Pending" });

    logEvent(
      "DoctorRequestTicket",
      `Pending change tickets retrieved - Count: ${tickets.length}`,
      req.user?._id
    );

    res.json(tickets);
  } catch (err) {
    logEvent(
      "DoctorRequestTicket",
      `Get pending change tickets error - Error: ${err.message}`,
      req.user?._id
    );
    res.status(500).json({ error: err.message });
  }
};

// Get a specific ticket by id
export const getTicketByID = async (req, res) => {
  try {
    const { id } = req.params;

    logEvent(
      "DoctorRequestTicket",
      `Get ticket by ID initiated - Ticket ID: ${id}`,
      req.user?._id
    );

    const ticket = await DoctorRequestTicket.findById({ _id: id });

    if (!ticket) {
      logEvent(
        "DoctorRequestTicket",
        `Get ticket failed - Ticket ID ${id} not found`,
        req.user?._id
      );
      return res.status(404).json({ error: "Ticket not found" });
    }

    logEvent(
      "DoctorRequestTicket",
      `Ticket retrieved - Ticket ID: ${id}, Status: ${ticket.status}, Requested By: ${ticket.requestedBy}`,
      req.user?._id
    );

    return res.json(ticket);
  } catch (err) {
    logEvent(
      "DoctorRequestTicket",
      `Get ticket error - Ticket ID: ${req.params?.id}, Error: ${err.message}`,
      req.user?._id
    );
    return res.status(500).json({ error: err.message });
  }
};

// Get all tickets in Progress by a Ops member by id
export const getInProgressTicketsByOpsId = async (req, res) => {
  try {
    const { opsId } = req.params;

    logEvent(
      "DoctorRequestTicket",
      `Get in-progress tickets by Ops ID initiated - Ops Member: ${opsId}`,
      req.user?._id
    );

    const opsObjectId = new mongoose.Types.ObjectId(opsId);
    const tickets = await DoctorRequestTicket.find({
      responsibleMember: opsObjectId,
      status: "In Progress",
    });

    if (!tickets) {
      logEvent(
        "DoctorRequestTicket",
        `Get in-progress tickets failed - Ops Member ${opsId} has no tickets`,
        req.user?._id
      );
      return res.status(404).json({ error: "Tickets not found" });
    }

    logEvent(
      "DoctorRequestTicket",
      `In-progress tickets retrieved - Ops Member: ${opsId}, Count: ${tickets.length}`,
      req.user?._id
    );

    return res.json(tickets);
  } catch (err) {
    logEvent(
      "DoctorRequestTicket",
      `Get in-progress tickets error - Ops Member: ${req.params?.opsId}, Error: ${err.message}`,
      req.user?._id
    );
    return res.status(500).json({ error: err.message });
  }
};

// Get all tickets (disregard status) by a Ops member by id
export const getAllTicketsByOpsId = async (req, res) => {
  try {
    const { opsId } = req.params;

    logEvent(
      "DoctorRequestTicket",
      `Get all tickets by Ops ID initiated - Ops Member: ${opsId}`,
      req.user?._id
    );

    const opsObjectId = new mongoose.Types.ObjectId(opsId);
    const tickets = await DoctorRequestTicket.find({
      responsibleMember: opsObjectId,
    });

    if (!tickets) {
      logEvent(
        "DoctorRequestTicket",
        `Get all tickets failed - Ops Member ${opsId} has no tickets`,
        req.user?._id
      );
      return res.status(404).json({ error: "Tickets not found" });
    }

    logEvent(
      "DoctorRequestTicket",
      `All tickets retrieved for Ops member - Ops Member: ${opsId}, Count: ${tickets.length}`,
      req.user?._id
    );

    return res.json(tickets);
  } catch (err) {
    logEvent(
      "DoctorRequestTicket",
      `Get all tickets by Ops ID error - Ops Member: ${req.params?.opsId}, Error: ${err.message}`,
      req.user?._id
    );
    return res.status(500).json({ error: err.message });
  }
};

// Move a pending ticket into In Progress
// Changes responsibleMember to the Ops User's id
export const startTicketProgress = async (req, res) => {
  try {
    const { ticketId } = req.params;

    logEvent(
      "DoctorRequestTicket",
      `Start ticket progress initiated - Ticket ID: ${ticketId}, Ops Member: ${req.user._id}`,
      req.user?._id
    );

    const ticket = await DoctorRequestTicket.findOne({
      _id: ticketId,
      status: "Pending",
    });

    if (!ticket) {
      logEvent(
        "DoctorRequestTicket",
        `Start ticket progress failed - Ticket ID ${ticketId} not found or already in progress`,
        req.user?._id
      );
      return res
        .status(404)
        .json({ error: "Pending ticket not found or already in progress." });
    }

    const previousStatus = ticket.status;
    ticket.status = "In Progress";
    ticket.responsibleMember = req.user._id;
    await ticket.save();

    logEvent(
      "DoctorRequestTicket",
      `Ticket moved to In Progress - Ticket ID: ${ticketId}, Previous Status: ${previousStatus}, Responsible Member: ${req.user._id}`,
      req.user?._id
    );

    res.json({
      message: "Ticket moved to In Progress",
      ticket,
    });
  } catch (err) {
    logEvent(
      "DoctorRequestTicket",
      `Start ticket progress error - Ticket ID: ${req.params?.ticketId}, Error: ${err.message}`,
      req.user?._id
    );
    res.status(500).json({ error: err.message });
  }
};

// Move a In Progress ticket to Completed
// Update approved by the Ops User's id
// Update date completed
export const completeTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    logEvent(
      "DoctorRequestTicket",
      `Complete ticket initiated - Ticket ID: ${ticketId}, Approved By: ${req.user._id}`,
      req.user?._id
    );

    const ticket = await DoctorRequestTicket.findOne({
      _id: ticketId,
      status: "In Progress",
    });

    if (!ticket) {
      logEvent(
        "DoctorRequestTicket",
        `Complete ticket failed - Ticket ID ${ticketId} not found or not in progress`,
        req.user?._id
      );
      return res
        .status(404)
        .json({ error: "Ticket not found or not in progress." });
    }

    const previousStatus = ticket.status;
    ticket.status = "Completed";
    ticket.approvedBy = req.user._id;
    ticket.dateCompleted = new Date();
    await ticket.save();

    logEvent(
      "DoctorRequestTicket",
      `Ticket marked as Completed - Ticket ID: ${ticketId}, Previous Status: ${previousStatus}, Approved By: ${
        req.user._id
      }, Completed At: ${ticket.dateCompleted.toISOString()}`,
      req.user?._id
    );

    res.json({
      message: "Ticket marked as Completed",
      ticket,
    });
  } catch (err) {
    logEvent(
      "DoctorRequestTicket",
      `Complete ticket error - Ticket ID: ${req.params?.ticketId}, Error: ${err.message}`,
      req.user?._id
    );
    res.status(500).json({ error: err.message });
  }
};
