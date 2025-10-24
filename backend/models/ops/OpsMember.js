// models/OpsMember.js
import mongoose from "mongoose";

const opsMemberSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    }, { timestamps: true }
);

export default mongoose.model("OpsMember", opsMemberSchema);