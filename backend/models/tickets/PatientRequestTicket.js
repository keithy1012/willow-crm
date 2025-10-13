// models/PatientRequestTicket.js

import mongoose from "mongoose";

const patientRequestTicketSchema = new mongoose.Schema(
  {
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    patientName: {
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
    },
    additionalNotes: {
      type: String,
      default: "No additional details"
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    responsibleMember: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const PatientRequestTicket = mongoose.model(
  "PatientRequestTicket",
  patientRequestTicketSchema
);

export default PatientRequestTicket;
