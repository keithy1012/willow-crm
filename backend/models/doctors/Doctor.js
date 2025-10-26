// models/Doctor.js
import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    profilePic: { type: String },
    bioContent: { type: String, required: true },
    education: { type: String, required: true },
    graduationDate: { type: Date, required: true },
    speciality: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
