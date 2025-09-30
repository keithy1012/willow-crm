// controllers/doctorTicketController.js
import Doctorrequestticket from "../models/DoctorTicketRequest.js";
import Doctor from "../models/Doctor.js";

export const submitDoctorTicket = async (req, res) => {
  try {
    const ticket = new Doctorrequestticket({
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
    const tickets = await Doctorrequestticket.find({ status: "Pending" }).populate("requestedBy", "firstName lastName email");
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const approveTicket = async (req, res) => {
  try {
    const ticket = await Doctorrequestticket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    // Create the doctor account
    const doctor = new Doctor({
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

    });

    await doctor.save();

    ticket.status = "Approved";
    ticket.reviewedBy = req.user._id;
    await ticket.save();

    res.json({ message: "Doctor approved and account created", doctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
