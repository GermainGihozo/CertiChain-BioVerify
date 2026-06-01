const mongoose = require("mongoose");

const verificationRequestSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      uppercase: true,
    },
    certificate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certificate",
    },
    hiringManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    studentEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected", "expired"],
      default: "pending",
    },
    verifiedAt: Date,
    verificationMethod: {
      type: String,
      enum: ["biometric", "email"],
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
verificationRequestSchema.index({ certificateId: 1 });
verificationRequestSchema.index({ hiringManagerId: 1 });
verificationRequestSchema.index({ studentEmail: 1 });
verificationRequestSchema.index({ status: 1 });
verificationRequestSchema.index({ expiresAt: 1 });

module.exports = mongoose.model("VerificationRequest", verificationRequestSchema);
