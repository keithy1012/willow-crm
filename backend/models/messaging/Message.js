import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    encryptedContent: {
      ciphertext: { type: String, required: true },
      ephemeralPublicKey: { type: String, required: true },
      nonce: { type: String, required: true },
    },

    // Copy encrypted for sender (so they can read their own messages)
    encryptedContentSender: {
      ciphertext: {
        type: String,
        required: false,
      },
      ephemeralPublicKey: {
        type: String,
        required: false,
      },
      nonce: {
        type: String,
        required: false,
      },
    },

    // Metadata (not encrypted)
    type: {
      type: String,
      default: "text",
    },

    delivered: {
      type: Boolean,
      default: false,
    },

    read: {
      type: Boolean,
      default: false,
    },

    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // HIPAA Compliance: Audit fields
    sentFromIP: String,
    deliveredAt: Date,
    readAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ conversation: 1, read: 1 });

// HIPAA: Auto-delete messages after 7 years
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 220752000 });

export default mongoose.model("Message", messageSchema);
