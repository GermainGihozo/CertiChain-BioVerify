const ActivityLog = require("../models/ActivityLog");

async function logActivity(action, options = {}) {
  try {
    await ActivityLog.create({
      action,
      userId: options.userId,
      institutionId: options.institutionId,
      certificateId: options.certificateId,
      details: options.details,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      success: options.success !== undefined ? options.success : true,
    });
  } catch (err) {
    // Non-critical — don't throw
    console.error("Activity log error:", err.message);
  }
}

module.exports = { logActivity };
