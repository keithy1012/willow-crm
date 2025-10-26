import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["Recurring", "Single"],
      required: true,
    },
    dayOfWeek: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: function () {
        return this.type === "Recurring";
      },
    },
    date: {
      type: Date,
      required: function () {
        return this.type === "Single";
      },
    },
    timeSlots: [
      {
        startTime: { type: String, required: true }, // Format: "09:00"
        endTime: { type: String, required: true }, // Format: "17:00"
        isBooked: { type: Boolean, default: false },
        appointmentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Appointment",
        },
      },
    ],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    indexes: [
      { doctor: 1, type: 1, dayOfWeek: 1 },
      { doctor: 1, date: 1 },
      { doctor: 1, isActive: 1 },
    ],
  }
);

export default mongoose.model("Availability", availabilitySchema);
