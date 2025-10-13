// models/Doctor.js
import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bioContent: { type: String, required: true },
    education: { type: String, required: true },
    graduationDate: { type: Date, required: true },
    speciality: { type: String, required: true },
    availability: [{ type: mongoose.Schema.Types.ObjectId, ref: "Availability" }],
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
