const User = require("../models/User");
const { logActivity } = require("../utils/activityLogger");

/**
 * GET /api/users/credentials
 * Get user's WebAuthn credentials
 */
async function getCredentials(req, res, next) {
  try {
    const credentials = req.user.webauthnCredentials.map((cred) => ({
      credentialId: cred.credentialId,
      label: cred.label,
      deviceType: cred.deviceType,
      registeredAt: cred.registeredAt,
      backedUp: cred.backedUp,
      transports: cred.transports,
    }));

    res.json({ credentials });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/users/profile
 * Update user profile
 */
async function updateProfile(req, res, next) {
  try {
    const { fullName, studentId } = req.body;

    if (fullName) {
      req.user.fullName = fullName.trim();
    }

    if (studentId !== undefined && req.user.role === "student") {
      req.user.studentId = studentId.trim();
    }

    await req.user.save();

    await logActivity("PROFILE_UPDATED", {
      userId: req.user._id,
      ipAddress: req.ip,
    });

    res.json({
      message: "Profile updated successfully",
      user: req.user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/users/password
 * Change user password
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    // Get user with password field
    const user = await User.findById(req.user._id).select("+password");

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      await logActivity("PASSWORD_CHANGE_FAILED", {
        userId: user._id,
        ipAddress: req.ip,
        success: false,
        details: { reason: "Wrong current password" },
      });
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    await logActivity("PASSWORD_CHANGED", {
      userId: user._id,
      ipAddress: req.ip,
    });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCredentials,
  updateProfile,
  changePassword,
};
