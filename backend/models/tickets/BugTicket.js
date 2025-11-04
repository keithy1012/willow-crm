// models/BugTicket.js
import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    submitter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: { type: String, required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, required: true },
    isResolved: { type: Boolean, required: true },
    dateCompleted: { type: Date, required: false },
  },
  { timestamps: true }
);

export default mongoose.model("BugTicket", ticketSchema);
