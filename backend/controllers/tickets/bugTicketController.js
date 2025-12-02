import mongoose from "mongoose";
import BugTicket from "../../models/tickets/BugTicket.js";
import User from "../../models/users/User.js";
import { logEvent } from "../../utils/logger.js";

// Create new generic ticket
export const createTicket = async (req, res) => {
  try {
    logEvent(
      "BugTicket",
      `Create ticket initiated - Submitter: ${req.user._id}, Title: ${req.body.title}`,
      req.user?._id
    );

    const ticket = new BugTicket({
      submitter: req.user._id,
      status: "Pending",
      ...req.body,
    });
    await ticket.save();
    logEvent(
      "BugTicket",
      `Ticket created successfully - Ticket ID: ${ticket._id}, Title: ${ticket.title}, Submitter: ${req.user._id}, Status: Pending`,
      req.user?._id
    );
    res.status(201).json({ message: "Ticket submitted successfully", ticket });
  } catch (err) {
    logEvent(
      "BugTicket",
      `Create ticket error - Submitter: ${req.user?._id}, Error: ${err.message}`,
      req.user?._id
    );
    res.status(400).json({ error: err.message });
  }
};

// Get all pending tickets
export const getPendingTickets = async (req, res) => {
  try {
    logEvent("BugTicket", "Get pending tickets initiated", req.user?._id);

    const tickets = await BugTicket.find({ status: "Pending" });
    // Find user details for each submitter
    const enrichedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        const user = await User.findById(ticket.submitter);
        return {
          ...ticket.toObject(),
          requestedBy: user ? `${user.firstName} ${user.lastName}` : null,
          requestedByType: user ? `${user.role}` : null,
          description: ticket.content,
          ticketName: ticket.title,
        };
      })
    );
    logEvent(
      "BugTicket",
      `Pending tickets retrieved - Count: ${enrichedTickets.length}`,
      req.user?._id
    );

    res.json(enrichedTickets);
  } catch (err) {
    logEvent(
      "BugTicket",
      `Get pending tickets error - Error: ${err.message}`,
      req.user?._id
    );
    res.status(500).json({ error: err.message });
  }
};

// Get a specific ticket by ID
export const getTicketByID = async (req, res) => {
  try {
    const { id } = req.params;
    logEvent(
      "BugTicket",
      `Get ticket by ID initiated - Ticket ID: ${id}`,
      req.user?._id
    );

    const ticket = await BugTicket.findById(id);
    if (!ticket) {
      logEvent(
        "BugTicket",
        `Get ticket failed - Ticket ID ${id} not found`,
        req.user?._id
      );
      return res.status(404).json({ error: "Ticket not found" });
    }
    const user = await User.findById(ticket.submitter);

    logEvent(
      "BugTicket",
      `Ticket retrieved - Ticket ID: ${id}, Title: ${ticket.title}, Status: ${ticket.status}, Submitter: ${ticket.submitter}`,
      req.user?._id
    );
    return res.json({
      ...ticket.toObject(),
      requestedBy: user ? `${user.firstName} ${user.lastName}` : null,
      requestedByType: user ? `${user.role}` : null,
      description: ticket.content,
      ticketName: ticket.title,
    });
  } catch (err) {
    logEvent(
      "BugTicket",
      `Get ticket error - Ticket ID: ${req.params?.id}, Error: ${err.message}`,
      req.user?._id
    );
    return res.status(500).json({ error: err.message });
  }
};

// Get all In Progress tickets assigned to a specific IT member
export const getInProgressTicketsByItId = async (req, res) => {
  try {
    const { itId } = req.params;
    logEvent(
      "BugTicket",
      `Get in-progress tickets by IT ID initiated - IT Member: ${itId}`,
      req.user?._id
    );
    const itObjectId = new mongoose.Types.ObjectId(itId);
    const tickets = await BugTicket.find({
      assignedTo: itObjectId,
      status: "In Progress",
    });

    const enrichedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        const user = await User.findById(ticket.submitter);
        return {
          ...ticket.toObject(),
          requestedBy: user ? `${user.firstName} ${user.lastName}` : null,
          requestedByType: user ? `${user.role}` : null,
          description: ticket.content,
          ticketName: ticket.title,
        };
      })
    );

    logEvent(
      "BugTicket",
      `In-progress tickets retrieved - IT Member: ${itId}, Count: ${enrichedTickets.length}`,
      req.user?._id
    );
    return res.json(enrichedTickets);
  } catch (err) {
    logEvent(
      "BugTicket",
      `Get in-progress tickets error - IT Member: ${req.params?.itId}, Error: ${err.message}`,
      req.user?._id
    );
    return res.status(500).json({ error: err.message });
  }
};

// Get all tickets (any status) assigned to a specific IT member
export const getAllTicketsByItId = async (req, res) => {
  try {
    const { itId } = req.params;
    logEvent(
      "BugTicket",
      `Get all tickets by IT ID initiated - IT Member: ${itId}`,
      req.user?._id
    );

    const itObjectId = new mongoose.Types.ObjectId(req.params.itId);
    const tickets = await BugTicket.find({ assignedTo: itObjectId });

    const enrichedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        const user = await User.findById(ticket.submitter);
        return {
          ...ticket.toObject(),
          requestedBy: user ? `${user.firstName} ${user.lastName}` : null,
          requestedByType: user ? `${user.role}` : null,
          description: ticket.content,
          ticketName: ticket.title,
        };
      })
    );
    logEvent(
      "BugTicket",
      `All tickets retrieved for IT member - IT Member: ${itId}, Count: ${enrichedTickets.length}`,
      req.user?._id
    );
    return res.json(enrichedTickets);
  } catch (err) {
    logEvent(
      "BugTicket",
      `Get all tickets by IT ID error - IT Member: ${req.params?.itId}, Error: ${err.message}`,
      req.user?._id
    );
    return res.status(500).json({ error: err.message });
  }
};

// Move a pending ticket into "In Progress"
export const startTicketProgress = async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    logEvent(
      "BugTicket",
      `Start ticket progress initiated - Ticket ID: ${ticketId}, Assigned To: ${req.user._id}`,
      req.user?._id
    );

    const ticket = await BugTicket.findOne({
      _id: ticketId,
      status: "Pending",
    });

    if (!ticket) {
      logEvent(
        "BugTicket",
        `Start ticket progress failed - Ticket ID ${ticketId} not found or already in progress`,
        req.user?._id
      );
      return res
        .status(404)
        .json({ error: "Pending ticket not found or already in progress." });
    }

    ticket.status = "In Progress";
    ticket.assignedTo = req.user._id;
    await ticket.save();
    logEvent(
      "BugTicket",
      `Ticket moved to In Progress - Ticket ID: ${ticketId}, Title: ${ticket.title}, Previous Status: ${previousStatus}, Assigned To: ${req.user._id}`,
      req.user?._id
    );
    res.json({
      message: "Ticket moved to In Progress",
      ticket,
    });
  } catch (err) {
    logEvent(
      "BugTicket",
      `Start ticket progress error - Ticket ID: ${req.params?.ticketId}, Error: ${err.message}`,
      req.user?._id
    );
    res.status(500).json({ error: err.message });
  }
};

// Move an In Progress ticket to Completed
export const completeTicket = async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    logEvent(
      "BugTicket",
      `Complete ticket initiated - Ticket ID: ${ticketId}, Approved By: ${req.user._id}`,
      req.user?._id
    );

    const ticket = await BugTicket.findOne({
      _id: ticketId,
      status: "In Progress",
    });

    if (!ticket) {
      logEvent(
        "BugTicket",
        `Complete ticket failed - Ticket ID ${ticketId} not found or not in progress`,
        req.user?._id
      );
      return res
        .status(404)
        .json({ error: "Ticket not found or not in progress." });
    }

    ticket.status = "Completed";
    ticket.approvedBy = req.user._id;
    ticket.dateCompleted = new Date();
    await ticket.save();
    logEvent(
      "BugTicket",
      `Ticket marked as Completed - Ticket ID: ${ticketId}, Title: ${
        ticket.title
      }, Previous Status: ${previousStatus}, Approved By: ${
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
      "BugTicket",
      `Complete ticket error - Ticket ID: ${req.params?.ticketId}, Error: ${err.message}`,
      req.user?._id
    );
    res.status(500).json({ error: err.message });
  }
};
