const VerificationRequest = require("../models/VerificationRequest");
const Certificate = require("../models/Certificate");
const User = require("../models/User");
const { logActivity } = require("../utils/activityLogger");
const { authenticateBiometric } = require("./webauthn.controller");

/**
 * POST /api/verification-requests
 * Create a new verification request
 */
async function createVerificationRequest(req, res, next) {
  try {
    const { certificateId, studentEmail, companyName, jobTitle, message } = req.body;

    // Validate required fields
    if (!certificateId || !studentEmail || !companyName || !jobTitle) {
      return res.status(400).json({
        error: "Certificate ID, student email, company name, and job title are required",
      });
    }

    // Check if certificate exists
    const certificate = await Certificate.findOne({ 
      certificateId: certificateId.toUpperCase() 
    });

    if (!certificate) {
      return res.status(404).json({
        error: "Certificate not found",
      });
    }

    // Check if certificate is issued
    if (certificate.status !== "issued") {
      return res.status(400).json({
        error: `Certificate is ${certificate.status}, not issued`,
      });
    }

    // Find student by email
    const student = await User.findOne({ email: studentEmail.toLowerCase() });

    // Create verification request
    const verificationRequest = await VerificationRequest.create({
      certificateId: certificateId.toUpperCase(),
      certificate: certificate._id,
      hiringManagerId: req.user._id,
      studentId: student?._id,
      studentEmail: studentEmail.toLowerCase(),
      companyName,
      jobTitle,
      message,
    });

    await logActivity("VERIFICATION_REQUEST_CREATED", {
      verificationRequestId: verificationRequest._id,
      certificateId,
      hiringManagerId: req.user._id,
      studentEmail,
    });

    res.status(201).json({
      message: "Verification request created successfully",
      verificationRequest: await verificationRequest.populate([
        { path: "certificate", select: "certificateTitle courseName institutionName studentName" },
        { path: "hiringManagerId", select: "fullName email" },
      ]),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/verification-requests
 * Get all verification requests for hiring manager
 */
async function getVerificationRequests(req, res, next) {
  try {
    const { status } = req.query;
    const query = { hiringManagerId: req.user._id };

    if (status) {
      query.status = status;
    }

    const requests = await VerificationRequest.find(query)
      .populate("certificate", "certificateTitle courseName institutionName studentName graduationYear")
      .populate("studentId", "fullName email")
      .sort({ createdAt: -1 });

    res.json({
      verificationRequests: requests,
      total: requests.length,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/verification-requests/student
 * Get verification requests for current student
 */
async function getStudentVerificationRequests(req, res, next) {
  try {
    const requests = await VerificationRequest.find({
      $or: [
        { studentId: req.user._id },
        { studentEmail: req.user.email },
      ],
    })
      .populate("certificate", "certificateTitle courseName institutionName graduationYear")
      .populate("hiringManagerId", "fullName email")
      .sort({ createdAt: -1 });

    res.json({
      verificationRequests: requests,
      total: requests.length,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/verification-requests/:id/verify
 * Student verifies their certificate with biometric
 */
async function verifyRequest(req, res, next) {
  try {
    const { id } = req.params;
    const { biometricVerified, userId } = req.body;

    const request = await VerificationRequest.findById(id);

    if (!request) {
      return res.status(404).json({ error: "Verification request not found" });
    }

    // Check if request belongs to current user
    if (
      request.studentId?.toString() !== req.user._id.toString() &&
      request.studentEmail !== req.user.email
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Check if already verified
    if (request.status === "verified") {
      return res.status(400).json({ error: "Request already verified" });
    }

    // Check if expired
    if (request.expiresAt < new Date()) {
      request.status = "expired";
      await request.save();
      return res.status(400).json({ error: "Verification request has expired" });
    }

    // Verify biometric authentication was successful
    if (!biometricVerified || userId !== req.user._id.toString()) {
      return res.status(400).json({ 
        error: "Biometric verification required",
        message: "Please complete biometric authentication to verify certificate ownership"
      });
    }

    // Update request status
    request.status = "verified";
    request.verifiedAt = new Date();
    request.verificationMethod = "biometric";
    request.studentId = req.user._id; // Ensure studentId is set

    await request.save();

    await logActivity("VERIFICATION_REQUEST_VERIFIED", {
      verificationRequestId: request._id,
      certificateId: request.certificateId,
      studentId: req.user._id,
      verificationMethod: "biometric",
    });

    res.json({
      message: "Certificate ownership verified successfully",
      verificationRequest: await request.populate([
        { path: "certificate", select: "certificateTitle courseName institutionName studentName" },
        { path: "hiringManagerId", select: "fullName email" },
      ]),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/verification-requests/:id/reject
 * Student rejects verification request
 */
async function rejectRequest(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const request = await VerificationRequest.findById(id);

    if (!request) {
      return res.status(404).json({ error: "Verification request not found" });
    }

    // Check if request belongs to current user
    if (
      request.studentId?.toString() !== req.user._id.toString() &&
      request.studentEmail !== req.user.email
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    request.status = "rejected";
    request.notes = reason || "Rejected by certificate owner";
    await request.save();

    await logActivity("VERIFICATION_REQUEST_REJECTED", {
      verificationRequestId: request._id,
      certificateId: request.certificateId,
      studentId: req.user._id,
    });

    res.json({
      message: "Verification request rejected",
      verificationRequest: request,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/verification-requests/:id
 * Get single verification request
 */
async function getVerificationRequest(req, res, next) {
  try {
    const { id } = req.params;

    const request = await VerificationRequest.findById(id)
      .populate("certificate")
      .populate("hiringManagerId", "fullName email")
      .populate("studentId", "fullName email");

    if (!request) {
      return res.status(404).json({ error: "Verification request not found" });
    }

    // Check authorization
    const isHiringManager = request.hiringManagerId._id.toString() === req.user._id.toString();
    const isStudent =
      request.studentId?._id.toString() === req.user._id.toString() ||
      request.studentEmail === req.user.email;
    const isAdmin = req.user.role === "admin";

    if (!isHiringManager && !isStudent && !isAdmin) {
      return res.status(403).json({ error: "Not authorized" });
    }

    res.json({ verificationRequest: request });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createVerificationRequest,
  getVerificationRequests,
  getStudentVerificationRequests,
  verifyRequest,
  rejectRequest,
  getVerificationRequest,
};
