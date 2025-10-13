// models/EmergencyContact.js
import mongoose from "mongoose";

const emergencycontactSchema = new mongoose.Schema(
  {
    emergencyContactID: { type: String, default: uuidv4, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    relationship: {type: String, required: true}
  },
  { timestamps: true }
);

export default mongoose.model("Emergencycontact", emergencycontactSchema);
