import Doctoraccountcreationrequest from "../../models/tickets/DoctorAccountCreationRequest.js";
import { createDoctorFromData } from "../doctors/doctorController.js";
import { logEvent } from "../../utils/logger.js";

export const submitDoctorTicket = async (req, res) => {
  try {
    logEvent(
      "DoctorTicket",
      `Submit doctor ticket initiated - Email: ${req.body.email}, Name: ${req.body.firstName} ${req.body.lastName}, Specialty: ${req.body.speciality}`,
      req.user?._id
    );
    const ticket = new Doctoraccountcreationrequest({
      ...req.body,
    });

    await ticket.save();
    logEvent(
      "DoctorTicket",
      `Doctor ticket submitted successfully - Ticket ID: ${ticket._id}, Email: ${ticket.email}, Name: ${ticket.firstName} ${ticket.lastName}, Specialty: ${ticket.speciality}`,
      req.user?._id
    );
    res.status(201).json({ message: "Ticket submitted successfully", ticket });
  } catch (err) {
    logEvent(
      "DoctorTicket",
      `Submit doctor ticket error - Email: ${req.body?.email}, Error: ${err.message}`,
      req.user?._id
    );
    res.status(400).json({ error: err.message });
  }
};

export const getPendingTickets = async (req, res) => {
  try {
    logEvent(
      "DoctorTicket",
      "Get pending doctor tickets initiated",
      req.user?._id
    );
    const tickets = await Doctoraccountcreationrequest.find({
      status: "Pending",
    });
    logEvent(
      "DoctorTicket",
      `Pending doctor tickets retrieved - Count: ${tickets.length}`,
      req.user?._id
    );

    res.json(tickets);
  } catch (err) {
    logEvent(
      "DoctorTicket",
      `Get pending doctor tickets error - Error: ${err.message}`,
      req.user?._id
    );
    res.status(500).json({ error: err.message });
  }
};

export const getAllTicketsByID = async (req, res) => {
  try {
    const { userID } = req.params;

    logEvent(
      "DoctorTicket",
      `Get all tickets by reviewer ID initiated - Reviewer: ${userID}`,
      req.user?._id
    );

    const tickets = await Doctoraccountcreationrequest.find({
      reviewedBy: userID,
    });

    logEvent(
      "DoctorTicket",
      `Tickets retrieved by reviewer - Reviewer: ${userID}, Count: ${tickets.length}`,
      req.user?._id
    );

    res.json(tickets);
  } catch (err) {
    logEvent(
      "DoctorTicket",
      `Get tickets by reviewer error - Reviewer: ${req.params?.userID}, Error: ${err.message}`,
      req.user?._id
    );
    res.status(500).json({ error: err.message });
  }
};

export const approveTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    logEvent(
      "DoctorTicket",
      `Approve doctor ticket initiated - Ticket ID: ${ticketId}, Reviewer: ${req.user._id}`,
      req.user?._id
    );

    const ticket = await Doctoraccountcreationrequest.findById(ticketId);

    if (!ticket) {
      logEvent(
        "DoctorTicket",
        `Approve ticket failed - Ticket ID ${ticketId} not found`,
        req.user?._id
      );
      return res.status(404).json({ error: "Ticket not found" });
    }
    // Prepare the doctor data from the ticket
    const doctorData = {
      firstName: ticket.firstName,
      lastName: ticket.lastName,
      email: ticket.email,
      username: ticket.username,
      password: ticket.password,
      phoneNumber: ticket.phoneNumber,
      profilePic: ticket.profilePic,
      bioContent: ticket.bioContent,
      education: ticket.education,
      graduationDate: ticket.graduationDate,
      speciality: ticket.speciality,
    };

    const { savedUser, savedDoctor } = await createDoctorFromData(doctorData);
    logEvent(
      "DoctorTicket",
      `Doctor account created - User ID: ${savedUser._id}, Doctor ID: ${savedDoctor._id}, Email: ${savedUser.email}`,
      req.user?._id
    );

    ticket.status = "Approved";
    ticket.reviewedBy = req.user._id;
    await ticket.save();

    logEvent(
      "DoctorTicket",
      `Doctor ticket approved successfully - Ticket ID: ${ticketId}, Doctor ID: ${savedDoctor._id}, User ID: ${savedUser._id}, Reviewer: ${req.user._id}, Name: ${ticket.firstName} ${ticket.lastName}, Specialty: ${ticket.speciality}`,
      req.user?._id
    );

    res.status(200).json({
      message: "Doctor approved and account created",
      user: savedUser,
      doctor: savedDoctor,
    });
  } catch (err) {
    logEvent(
      "DoctorTicket",
      `Approve doctor ticket error - Ticket ID: ${req.params?.ticketId}, Error: ${err.message}`,
      req.user?._id
    );
    res.status(500).json({ error: err.message });
  }
};
