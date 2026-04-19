const mongoose = require("mongoose");

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Institution name is required"],
      trim: true,
      unique: true,
      maxlength: 200,
    },
    shortName: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    walletAddress: {
      type: String,
      required: [true, "Wallet address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address"],
    },
    country: { type: String, trim: true },
    city: { type: String, trim: true },
    website: { type: String, trim: true },
    logoUrl: { type: String },
    description: { type: String, maxlength: 1000 },
    isActive: { type: Boolean, default: true },
    // Blockchain registration status
    registeredOnChain: { type: Boolean, default: false },
    chainTxHash: { type: String },
    // Admin who approved this institution
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
  },
  {
    timestamps: true,
  }
);

// walletAddress index created by unique:true above
institutionSchema.index({ isActive: 1 });

module.exports = mongoose.model("Institution", institutionSchema);
