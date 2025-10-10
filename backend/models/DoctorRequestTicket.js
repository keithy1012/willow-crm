// models/DoctorRequestTicket.js

import mongoose from "mongoose";

const doctorRequestTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
    },
    doctorName: {
      type: String,
      required: true,
      trim: true,
    },
    ticketName: {
      type: String,
      required: true,
      trim: true,
    },
    dateCreated: {
      type: Date,
      default: Date.now,
    },
    dateCompleted: {
        type: Date,
        required: false
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    additionalNotes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const DoctorRequestTicket = mongoose.model(
  "DoctorRequestTicket",
  doctorRequestTicketSchema
);

export default DoctorRequestTicket;
