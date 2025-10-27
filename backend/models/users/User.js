// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
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
    role: {
      type: String,
      enum: ["Doctor", "Patient", "Ops", "IT"],
      required: true,
    },

    // Add these fields for messaging functionality:
    isOnline: {
      type: Boolean,
      default: false,
    },

    lastActive: {
      type: Date,
      default: Date.now,
    },

    // Push notification tokens (optional for future)
    pushTokens: [
      {
        token: String,
        platform: {
          type: String,
          enum: ["ios", "android", "web"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Messaging preferences
    messagingPreferences: {
      allowMessagesFrom: {
        type: String,
        enum: ["everyone", "doctors-only", "patients-only", "contacts"],
        default: "everyone",
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: true,
      },
      soundEnabled: {
        type: Boolean,
        default: true,
      },
    },

    // Blocked users
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Add password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Add method to compare passwords
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
