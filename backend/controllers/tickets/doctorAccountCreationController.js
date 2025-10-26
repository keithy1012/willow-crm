// controllers/doctorTicketController.js
import Doctoraccountcreationrequest from "../../models/tickets/DoctorAccountCreationRequest.js";
import { createDoctorFromData } from "../doctors/doctorController.js";

export const submitDoctorTicket = async (req, res) => {
  try {
    const ticket = new Doctoraccountcreationrequest({
      ...req.body,
    });

    await ticket.save();
    res.status(201).json({ message: "Ticket submitted successfully", ticket });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getPendingTickets = async (req, res) => {
  try {
    const tickets = await Doctoraccountcreationrequest.find({
      status: "Pending",
    });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllTicketsByID = async (req, res) => {
  try {
    const tickets = await Doctoraccountcreationrequest.find({
      reviewedBy: req.params.userID,
    });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const approveTicket = async (req, res) => {
  try {
    const ticket = await Doctoraccountcreationrequest.findById(
      req.params.ticketId
    );
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

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

    ticket.status = "Approved";
    ticket.reviewedBy = req.user._id;
    await ticket.save();

    res.status(200).json({
      message: "Doctor approved and account created",
      user: savedUser,
      doctor: savedDoctor,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
