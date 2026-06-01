const express = require("express");
const router = express.Router();
const { authenticate, requireRole } = require("../middleware/auth");
const {
  createVerificationRequest,
  getVerificationRequests,
  getStudentVerificationRequests,
  verifyRequest,
  rejectRequest,
  getVerificationRequest,
} = require("../controllers/verificationRequest.controller");

// Hiring Manager routes
router.post("/", authenticate, requireRole("hiring_manager", "admin"), createVerificationRequest);
router.get("/", authenticate, requireRole("hiring_manager", "admin"), getVerificationRequests);

// Student routes
router.get("/student", authenticate, requireRole("student"), getStudentVerificationRequests);
router.post("/:id/verify", authenticate, requireRole("student"), verifyRequest);
router.post("/:id/reject", authenticate, requireRole("student"), rejectRequest);

// Shared routes
router.get("/:id", authenticate, getVerificationRequest);

module.exports = router;
