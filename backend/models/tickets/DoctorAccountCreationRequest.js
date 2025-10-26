// models/DoctorAccountCreationRequest.js
import mongoose from "mongoose";

const doctorTicketSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    username: { type: String, unique: true },
    password: { type: String, required: true},
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    bioContent: { type: String, required: true },
    education: { type: String, required: true },
    graduationDate: { type: Date, required: true },
    speciality: { type: String, required: true },
    availability: [{ type: mongoose.Schema.Types.ObjectId, ref: "Availability" }],
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" , required: true},
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Ops team member
    notes: String,
    profilePic: String
  },
  { timestamps: true }
);

export default mongoose.model("Doctoraccountcreationrequest", doctorTicketSchema);
