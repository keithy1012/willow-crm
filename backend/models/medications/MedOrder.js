import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const medorderSchema = new mongoose.Schema(
  {
    orderID: { type: String, default: uuidv4, unique: true },
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
    prescribedOn: { type: Date, required: true },
    medicationName: { type: String, required: true },
    dosage: { type: String, required: false },
    instruction: { type: String, required: true },
    recurringEvery: { type: String, required: false },
    duration: { type: String, required: false },
    quantity: { type: String, required: false },
    refillCount: { type: Number, default: 0 },
    lastRefillDate: { type: Date, required: false },
  },
  { timestamps: true }
);

export default mongoose.model("Medorder", medorderSchema);
