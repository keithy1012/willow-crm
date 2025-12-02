import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Can be null for failed logins
    index: true,
  },

  action: {
    type: String,
    required: true,
    enum: [
      "MESSAGE_SENT",
      "MESSAGE_READ",
      "MESSAGES_ACCESSED",
      "CONVERSATION_CREATED",
      "KEY_REGISTERED",
      "KEY_ROTATED",
      "LOGIN",
      "LOGOUT",
      "FAILED_LOGIN",
      "PASSWORD_CHANGED",
      "ACCOUNT_LOCKED",
      "ACCOUNT_UNLOCKED",
    ],
    index: true,
  },

  resourceType: {
    type: String,
    enum: ["MESSAGE", "CONVERSATION", "USER", "APPOINTMENT"],
  },

  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
  },

  ipAddress: String,
  userAgent: String,

  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },

  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound indexes for common queries
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });
auditLogSchema.index({ timestamp: -1 });

// HIPAA: Keep audit logs for 6 years minimum
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 189216000 }); // 6 years

export default mongoose.model("AuditLog", auditLogSchema);
