// models/User.js
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const userSchema = new mongoose.Schema(
  {
    userID: { type: String, default: uuidv4, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    password: { type: String, required: true, select: false },
    phoneNumber: String,
    profilePic: String,
    role: { type: String, enum: ["Doctor", "Patient", "Ops", "IT"], required: true },
  },
  { timestamps: true }
);

// Create UserDisplay view
userSchema.methods.toDisplay = function () {
  return {
    userID: this.userID,
    firstName: this.firstName,
    lastName: this.lastName,
    username: this.username,
    email: this.email,
    profilePic: this.profilePic,
  };
};

export default mongoose.model("User", userSchema);
