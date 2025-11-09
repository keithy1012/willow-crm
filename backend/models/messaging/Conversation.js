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
      default: "direct",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    unreadCounts: {
      type: Map,
      of: Number,
      default: new Map(),
    },

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

conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });
conversationSchema.index({ participants: 1, isActive: 1 });

export default mongoose.model("Conversation", conversationSchema);