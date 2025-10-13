// models/User.js
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

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

  // Hash pswrd before saving user
  userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
      return next();
    }
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  });
  
  // compare a given password with the stored hash
  userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };
  