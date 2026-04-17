const Institution = require("../models/Institution");
const User = require("../models/User");
const { registerInstitutionOnChain } = require("../utils/blockchain");
const { logActivity } = require("../utils/activityLogger");

/**
 * POST /api/institutions
 * Admin creates an institution and its admin user.
 */
async function createInstitution(req, res, next) {
  try {
    const {
      name,
      shortName,
      email,
      walletAddress,
      country,
      city,
      website,
      description,
      // Institution admin credentials
      adminEmail,
      adminPassword,
      adminFullName,
    } = req.body;

    // Create institution record
    const institution = await Institution.create({
      name,
      shortName,
      email,
      walletAddress: walletAddress.toLowerCase(),
      country,
      city,
      website,
      description,
      approvedBy: req.user._id,
      approvedAt: new Date(),
    });

    // Create institution admin user
    const instUser = await User.create({
      fullName: adminFullName || name,
      email: adminEmail,
      password: adminPassword,
      role: "institution",
      walletAddress: walletAddress.toLowerCase(),
      institutionId: institution._id,
    });

    // Register on blockchain
    try {
      const { txHash } = await registerInstitutionOnChain(walletAddress, name);
      institution.registeredOnChain = true;
      institution.chainTxHash = txHash;
      await institution.save();
    } catch (chainErr) {
      // Log but don't fail — can retry later
      console.error("Blockchain registration failed:", chainErr.message);
    }

    await logActivity("INSTITUTION_REGISTERED", {
      userId: req.user._id,
      institutionId: institution._id,
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: "Institution created",
      institution,
      adminUser: instUser.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/institutions
 */
async function listInstitutions(req, res, next) {
  try {
    const { page = 1, limit = 20, active } = req.query;
    const filter = {};
    if (active !== undefined) filter.isActive = active === "true";

    const institutions = await Institution.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Institution.countDocuments(filter);

    res.json({ institutions, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/institutions/:id
 */
async function getInstitution(req, res, next) {
  try {
    const institution = await Institution.findById(req.params.id);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }
    res.json({ institution });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/institutions/:id
 * Institution admin or system admin can update.
 */
async function updateInstitution(req, res, next) {
  try {
    const institution = await Institution.findById(req.params.id);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    // Only admin or the institution's own user
    if (
      req.user.role !== "admin" &&
      String(req.user.institutionId) !== String(institution._id)
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const allowed = ["name", "shortName", "country", "city", "website", "description", "logoUrl"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) institution[field] = req.body[field];
    });

    await institution.save();
    res.json({ message: "Institution updated", institution });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/institutions/:id  (deactivate)
 */
async function deactivateInstitution(req, res, next) {
  try {
    const institution = await Institution.findById(req.params.id);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    institution.isActive = false;
    await institution.save();

    await logActivity("INSTITUTION_DEACTIVATED", {
      userId: req.user._id,
      institutionId: institution._id,
    });

    res.json({ message: "Institution deactivated" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createInstitution,
  listInstitutions,
  getInstitution,
  updateInstitution,
  deactivateInstitution,
};
