// models/EmergencyContact.js
import mongoose from "mongoose";

const emergencycontactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    relationship: {type: String, required: true}
  },
  { timestamps: true }
);

export default mongoose.model("Emergencycontact", emergencycontactSchema);
