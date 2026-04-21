const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    // Student / owner
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentName: { type: String, required: true, trim: true },
    studentWallet: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    // Institution
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    institutionName: { type: String, required: true },
    institutionWallet: { type: String, required: true, lowercase: true },
    // Certificate details
    certificateTitle: { type: String, required: true, trim: true },
    courseName: { type: String, required: true, trim: true },
    graduationYear: { type: Number, required: true },
    grade: { type: String, trim: true },
    honors: { type: String, trim: true },
    // Cryptographic proof
    certificateHash: {
      type: String,
      required: true,
      unique: true,
    },
    // Blockchain record
    blockchainTxHash: { type: String },
    blockNumber: { type: Number },
    isOnChain: { type: Boolean, default: false },
    // Status
    status: {
      type: String,
      enum: ["pending_student", "pending_admin", "issued", "rejected", "revoked"],
      default: "pending_student",
    },
    // Student biometric confirmation
    studentConfirmedAt: Date,
    studentConfirmedBiometric: { type: Boolean, default: false },
    // Admin approval
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,
    // Rejection
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectedAt: Date,
    rejectionReason: { type: String },
    rejectedStage: { type: String, enum: ["admin"] }, // who rejected
    // Revocation
    revocationReason: { type: String },
    revokedAt: Date,
    revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // QR code data URL
    qrCode: { type: String },
    // Issued by (institution user)
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// certificateId and certificateHash indexes created by unique:true above
certificateSchema.index({ studentId: 1 });
certificateSchema.index({ institutionId: 1 });
certificateSchema.index({ status: 1 });
certificateSchema.index({ studentWallet: 1 });

module.exports = mongoose.model("Certificate", certificateSchema);
