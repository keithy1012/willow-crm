// models/Message.js
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const messageSchema = new mongoose.Schema(
  {
    messageID: { type: String, default: uuidv4, unique: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, required: true },
 
  },
  { timestamps: true }
);


export default mongoose.model("Message", messageSchema);
