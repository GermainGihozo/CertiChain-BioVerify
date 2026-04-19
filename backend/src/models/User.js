const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false, // Never return password in queries
    },
    role: {
      type: String,
      enum: ["student", "institution", "admin"],
      default: "student",
    },
    studentId: {
      type: String,
      trim: true,
      sparse: true,
    },
    walletAddress: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      match: [/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address"],
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
    },
    // WebAuthn credentials (one user can have multiple devices)
    webauthnCredentials: [
      {
        credentialId: { type: String, required: true },
        publicKey: { type: String, required: true },
        counter: { type: Number, default: 0 },
        deviceType: { type: String },
        backedUp: { type: Boolean, default: false },
        transports: [String],
        registeredAt: { type: Date, default: Date.now },
        label: { type: String, default: "My Device" },
      },
    ],
    // Pending WebAuthn challenge (temporary, cleared after use)
    webauthnChallenge: {
      type: String,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
    profileImage: String,
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// email and walletAddress indexes are created by unique:true above
userSchema.index({ role: 1 });

// ─── Pre-save: hash password ──────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance Methods ─────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.webauthnChallenge;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
