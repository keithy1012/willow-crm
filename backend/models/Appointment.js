// models/Appointment.js
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    appointmentID: { type: String, default: uuidv4, unique: true },
    patientID: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorID: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    summary: { type: String, required: false },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {type: String, enum:[""], required: true}
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
