// controllers/doctorTicketController.js
import Doctoraccountcreationrequest from "../models/DoctorAccountCreationRequest.js";
import { createDoctor } from "./doctorController.js";


export const submitDoctorTicket = async (req, res) => {
  try {
    const ticket = new Doctoraccountcreationrequest({
      requestedBy: req.user._id,
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
    const tickets = await Doctoraccountcreationrequest.find({ status: "Pending" }).populate("requestedBy", "firstName lastName email");
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const approveTicket = async (req, res) => {
  try {
    const ticket = await Doctoraccountcreationrequest.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    // Build the doctor payload for createDoctor
    const doctorData = {
      user: ticket.user,
      firstName: ticket.firstName,
      lastName: ticket.lastName,
      email: ticket.email,
      phoneNumber: ticket.phoneNumber,
      bioContent: ticket.bioContent,
      education: ticket.education,
      graduationDate: ticket.graduationDate,
      speciality: ticket.speciality,
      availability: ticket.availability,
      role: "Doctor",
      password: "temporaryPassword123",
    };

    // Call doctorController.createDoctor
    const fakeReq = { body: doctorData };
    let doctorResponse;

    const fakeRes = {
      status: (code) => ({
        json: (data) => {
          doctorResponse = { code, data };
        },
      }),
    };

    await createDoctor(fakeReq, fakeRes);

    // Update the ticket status
    ticket.status = "Approved";
    ticket.reviewedBy = req.user._id;
    await ticket.save();

    res.json({
      message: "Doctor approved and account created",
      doctor: doctorResponse?.data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
