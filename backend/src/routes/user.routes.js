const router = require("express").Router();
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");

// GET /api/users/profile
router.get("/profile", authenticate, (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/users/profile
router.put("/profile", authenticate, async (req, res, next) => {
  try {
    const allowed = ["fullName", "studentId", "profileImage"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) req.user[field] = req.body[field];
    });
    await req.user.save();
    res.json({ message: "Profile updated", user: req.user.toSafeObject() });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id/credentials  — list biometric credentials
router.get("/credentials", authenticate, (req, res) => {
  const creds = req.user.webauthnCredentials.map((c) => ({
    credentialId: c.credentialId,
    label: c.label,
    deviceType: c.deviceType,
    registeredAt: c.registeredAt,
    transports: c.transports,
  }));
  res.json({ credentials: creds });
});

module.exports = router;
