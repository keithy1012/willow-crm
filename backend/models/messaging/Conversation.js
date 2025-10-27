// backend/models/messaging/Conversation.js
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    type: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // For group conversations
    name: String,
    avatar: String,

    // Track unread count per participant
    unreadCounts: {
      type: Map,
      of: Number,
      default: new Map(),
    },

    // Track last read message per participant
    lastRead: {
      type: Map,
      of: mongoose.Schema.Types.ObjectId,
      default: new Map(),
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });
conversationSchema.index({ participants: 1, isActive: 1 });

// Ensure no duplicate direct conversations
conversationSchema.index(
  { participants: 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: { type: "direct" },
  }
);

export default mongoose.model("Conversation", conversationSchema);
