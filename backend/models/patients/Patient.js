// models/Patient.js
import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    birthday: { type: Date, required: true },
    address: { type: String, required: true },
    bloodtype: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    allergies: [String],
    medicalHistory: [String],
    emergencyContact: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Emergencycontact" },
    ],
    insuranceCardFront: {
      data: Buffer,
      contentType: String, // e.g., "image/jpeg" or "image/png"
    },
    insuranceCardBack: {
      data: Buffer,
      contentType: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Patient", patientSchema);
