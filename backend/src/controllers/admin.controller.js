const User = require("../models/User");
const Institution = require("../models/Institution");
const Certificate = require("../models/Certificate");
const ActivityLog = require("../models/ActivityLog");

/**
 * GET /api/admin/stats
 */
async function getStats(req, res, next) {
  try {
    const [
      totalUsers,
      totalStudents,
      totalInstitutions,
      totalCertificates,
      issuedCertificates,
      revokedCertificates,
      recentActivity,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      Institution.countDocuments({ isActive: true }),
      Certificate.countDocuments(),
      Certificate.countDocuments({ status: "issued" }),
      Certificate.countDocuments({ status: "revoked" }),
      ActivityLog.find().sort({ createdAt: -1 }).limit(10),
    ]);

    res.json({
      stats: {
        totalUsers,
        totalStudents,
        totalInstitutions,
        totalCertificates,
        issuedCertificates,
        revokedCertificates,
      },
      recentActivity,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/users
 */
async function listUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password -webauthnChallenge")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);
    res.json({ users, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/users/:id/toggle
 * Activate / deactivate a user.
 */
async function toggleUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User ${user.isActive ? "activated" : "deactivated"}`, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/activity
 */
async function getActivityLogs(req, res, next) {
  try {
    const { page = 1, limit = 50, action } = req.query;
    const filter = {};
    if (action) filter.action = action;

    const logs = await ActivityLog.find(filter)
      .populate("userId", "fullName email role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await ActivityLog.countDocuments(filter);
    res.json({ logs, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/seed
 * Create initial admin user (only if no admin exists).
 */
async function seedAdmin(req, res, next) {
  try {
    const existing = await User.findOne({ role: "admin" });
    if (existing) {
      return res.status(409).json({ error: "Admin already exists" });
    }

    const { email, password, fullName } = req.body;
    const admin = await User.create({
      fullName: fullName || "System Administrator",
      email,
      password,
      role: "admin",
    });

    res.status(201).json({
      message: "Admin created",
      user: admin.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats, listUsers, toggleUser, getActivityLogs, seedAdmin };
