// models/Ticket.js
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const ticketSchema = new mongoose.Schema(

  {
    ticketID: { type: String, default: uuidv4, unique: true },
    submitter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, required: true },
    isResolved: { type: Boolean, required: true},
    resolvedAt: { type: Date, required: false },
  },
  { timestamps: true }
);


export default mongoose.model("Ticket", ticketSchema);
