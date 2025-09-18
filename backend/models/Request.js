// models/Request.js
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const requestSchema = new mongoose.Schema(

  {
    requestID: { type: String, default: uuidv4, unique: true },
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    opsID: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, required: true },
    isResolved: { type: Boolean, required: true},
    resolvedAt: { type: Date, required: false },
  },
  { timestamps: true }
);


export default mongoose.model("Request", requestSchema);
