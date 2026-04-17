const { validationResult } = require("express-validator");
const User = require("../models/User");
const Institution = require("../models/Institution");
const { generateToken } = require("../utils/jwt");
const { logActivity } = require("../utils/activityLogger");

/**
 * POST /api/auth/register
 * Register a new student account.
 */
async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, password, studentId, walletAddress } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      studentId,
      walletAddress: walletAddress?.toLowerCase(),
      role: "student",
    });

    const token = generateToken(user._id, user.role);

    await logActivity("USER_REGISTERED", {
      userId: user._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(201).json({
      message: "Registration successful",
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await logActivity("USER_LOGIN", {
        userId: user._id,
        ipAddress: req.ip,
        success: false,
        details: { reason: "Wrong password" },
      });
      return res.status(401).json({ error: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);

    await logActivity("USER_LOGIN", {
      userId: user._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // If institution user, attach institution info
    let institutionData = null;
    if (user.role === "institution" && user.institutionId) {
      institutionData = await Institution.findById(user.institutionId);
    }

    res.json({
      message: "Login successful",
      token,
      user: user.toSafeObject(),
      institution: institutionData,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 */
async function getMe(req, res) {
  res.json({ user: req.user });
}

/**
 * PUT /api/auth/update-wallet
 */
async function updateWallet(req, res, next) {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    // Check not taken by another user
    const existing = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
      _id: { $ne: req.user._id },
    });
    if (existing) {
      return res.status(409).json({ error: "Wallet address already in use" });
    }

    req.user.walletAddress = walletAddress.toLowerCase();
    await req.user.save();

    res.json({ message: "Wallet updated", walletAddress: req.user.walletAddress });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe, updateWallet };
