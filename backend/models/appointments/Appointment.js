import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const appointmentSchema = new mongoose.Schema(
  {
    appointmentID: { type: String, default: uuidv4, unique: true },
    patientID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    summary: { type: String, required: false },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled", "No-Show", "In-Progress"],
      default: "Scheduled",
      required: true,
    },

    // NEW FIELDS FOR PDF DOCUMENTS
    // After Visit Summary
    afterVisitSummary: {
      type: String, // Base64 encoded PDF
      required: false,
      select: false, // Don't include by default in queries for performance
    },
    afterVisitSummaryName: {
      type: String, // Original filename
      required: false,
    },
    afterVisitSummaryUploadDate: {
      type: Date,
      required: false,
    },

    // Notes and Instructions
    notesAndInstructions: {
      type: String, // Base64 encoded PDF
      required: false,
      select: false, // Don't include by default in queries for performance
    },
    notesAndInstructionsName: {
      type: String, // Original filename
      required: false,
    },
    notesAndInstructionsUploadDate: {
      type: Date,
      required: false,
    },

    // Optional: Add notes field if you want to store text notes separately from PDFs
    notes: {
      type: String,
      required: false,
    },

    // Optional: Add symptoms array if you want to track this
    symptoms: {
      type: [String],
      default: [],
      required: false,
    },
  },
  { timestamps: true }
);

// Add indexes for better query performance
appointmentSchema.index({ patientID: 1, startTime: -1 });
appointmentSchema.index({ doctorID: 1, startTime: -1 });
appointmentSchema.index({ appointmentID: 1 });

// Virtual to check if documents exist without loading the full base64 data
appointmentSchema.virtual("hasAfterVisitSummary").get(function () {
  return !!this.afterVisitSummaryName;
});

appointmentSchema.virtual("hasNotesAndInstructions").get(function () {
  return !!this.notesAndInstructionsName;
});

// Method to get appointment with documents (explicitly including base64 data)
appointmentSchema.statics.findByIdWithDocuments = function (id) {
  return this.findById(id).select("+afterVisitSummary +notesAndInstructions");
};

// Method to get appointment without documents (for listing views)
appointmentSchema.statics.findByIdWithoutDocuments = function (id) {
  return this.findById(id);
};

export default mongoose.model("Appointment", appointmentSchema);
