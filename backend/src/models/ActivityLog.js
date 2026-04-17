const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "USER_REGISTERED",
        "USER_LOGIN",
        "USER_LOGOUT",
        "INSTITUTION_REGISTERED",
        "INSTITUTION_DEACTIVATED",
        "CERTIFICATE_ISSUED",
        "CERTIFICATE_REVOKED",
        "CERTIFICATE_VERIFIED",
        "CERTIFICATE_ACCESSED",
        "BIOMETRIC_REGISTERED",
        "BIOMETRIC_VERIFIED",
        "BIOMETRIC_FAILED",
        "FRAUD_ATTEMPT",
        "ADMIN_ACTION",
      ],
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: "Institution" },
    certificateId: { type: String },
    details: { type: mongoose.Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    success: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ action: 1 });
activityLogSchema.index({ userId: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
