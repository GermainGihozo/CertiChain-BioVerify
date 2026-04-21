const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");
const Certificate = require("../models/Certificate");
const User = require("../models/User");
const Institution = require("../models/Institution");
const { generateCertificateHash } = require("../utils/certificateHash");
const { issueCertificateOnChain, revokeCertificateOnChain } = require("../utils/blockchain");
const { logActivity } = require("../utils/activityLogger");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateCertId(institutionShortName, year) {
  const short = (institutionShortName || "CERT").toUpperCase().replace(/\s+/g, "").slice(0, 6);
  const uid = uuidv4().split("-")[0].toUpperCase();
  return `${short}-${year}-${uid}`;
}

// ─── STAGE 1: Institution issues ──────────────────────────────────────────────

/**
 * POST /api/certificates
 * Institution submits a certificate.
 * Status → "pending_student" (awaiting student biometric confirmation)
 */
async function issueCertificate(req, res, next) {
  try {
    const { studentEmail, studentWallet, certificateTitle, courseName, graduationYear, grade, honors } = req.body;

    const student = await User.findOne({
      $or: [
        { email: studentEmail },
        { walletAddress: studentWallet?.toLowerCase() },
      ],
      role: "student",
    });
    if (!student) {
      return res.status(404).json({ error: "Student not found. Make sure the student is registered." });
    }

    const institution = await Institution.findById(req.user.institutionId);
    if (!institution || !institution.isActive) {
      return res.status(403).json({ error: "Institution not active" });
    }

    const certStudentWallet = studentWallet?.toLowerCase() || student.walletAddress;
    if (!certStudentWallet) {
      return res.status(400).json({ error: "Student wallet address is required for blockchain issuance" });
    }

    const certId = generateCertId(institution.shortName, graduationYear);

    const certHash = generateCertificateHash({
      certificateId: certId,
      studentName: student.fullName,
      courseName,
      certificateTitle,
      studentWallet: certStudentWallet,
      institutionWallet: institution.walletAddress,
      graduationYear: Number(graduationYear),
    });

    const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify/${certId}`;
    const qrCode = await QRCode.toDataURL(verifyUrl);

    const certificate = await Certificate.create({
      certificateId: certId,
      studentId: student._id,
      studentName: student.fullName,
      studentWallet: certStudentWallet,
      institutionId: institution._id,
      institutionName: institution.name,
      institutionWallet: institution.walletAddress,
      certificateTitle,
      courseName,
      graduationYear: Number(graduationYear),
      grade,
      honors,
      certificateHash: certHash,
      qrCode,
      issuedBy: req.user._id,
      status: "pending_student", // Stage 1 complete — waiting for student
    });

    await logActivity("CERTIFICATE_ISSUED", {
      userId: req.user._id,
      institutionId: institution._id,
      certificateId: certId,
      ipAddress: req.ip,
      details: { stage: "pending_student" },
    });

    res.status(201).json({
      message: "Certificate submitted. Awaiting student biometric confirmation.",
      certificate,
    });
  } catch (err) {
    next(err);
  }
}

// ─── STAGE 2: Student confirms with biometric ─────────────────────────────────

/**
 * POST /api/certificates/:id/confirm
 * Student confirms ownership via biometric (WebAuthn already verified by middleware).
 * Status → "pending_admin" (awaiting admin approval)
 */
async function confirmCertificate(req, res, next) {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.id });
    if (!cert) return res.status(404).json({ error: "Certificate not found" });

    // Must belong to this student
    if (String(cert.studentId) !== String(req.user._id)) {
      return res.status(403).json({ error: "This certificate does not belong to you" });
    }

    if (cert.status !== "pending_student") {
      return res.status(400).json({
        error: cert.status === "pending_admin"
          ? "You have already confirmed this certificate"
          : `Certificate is already ${cert.status}`,
      });
    }

    cert.status = "pending_admin";
    cert.studentConfirmedAt = new Date();
    cert.studentConfirmedBiometric = true;
    await cert.save();

    await logActivity("CERTIFICATE_STUDENT_CONFIRMED", {
      userId: req.user._id,
      certificateId: cert.certificateId,
      ipAddress: req.ip,
    });

    res.json({
      message: "Certificate confirmed. Awaiting admin approval.",
      certificate: cert,
    });
  } catch (err) {
    next(err);
  }
}

// ─── STAGE 3a: Admin approves ─────────────────────────────────────────────────

/**
 * POST /api/certificates/:id/approve
 * Admin approves → issues on blockchain → status "issued"
 */
async function approveCertificate(req, res, next) {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.id });
    if (!cert) return res.status(404).json({ error: "Certificate not found" });

    if (cert.status !== "pending_admin") {
      return res.status(400).json({
        error: cert.status === "pending_student"
          ? "Student has not confirmed this certificate yet"
          : `Certificate is already ${cert.status}`,
      });
    }

    // Issue on blockchain
    let isOnChain = false;
    let txHash, blockNumber;
    try {
      ({ txHash, blockNumber } = await issueCertificateOnChain({
        certificateId: cert.certificateId,
        certificateHash: cert.certificateHash,
        ownerWallet: cert.studentWallet,
        studentName: cert.studentName,
        courseName: cert.courseName,
        certificateTitle: cert.certificateTitle,
        graduationYear: cert.graduationYear,
      }));
      isOnChain = true;
    } catch (chainErr) {
      console.error("Blockchain issuance failed:", chainErr.message);
      // Still mark as issued in DB — blockchain can be retried
    }

    cert.status = "issued";
    cert.approvedBy = req.user._id;
    cert.approvedAt = new Date();
    if (isOnChain) {
      cert.blockchainTxHash = txHash;
      cert.blockNumber = blockNumber;
      cert.isOnChain = true;
    }
    await cert.save();

    await logActivity("CERTIFICATE_APPROVED", {
      userId: req.user._id,
      certificateId: cert.certificateId,
      ipAddress: req.ip,
      details: { isOnChain },
    });

    res.json({
      message: isOnChain
        ? "Certificate approved and recorded on blockchain ✓"
        : "Certificate approved (blockchain pending — node may be offline)",
      certificate: cert,
    });
  } catch (err) {
    next(err);
  }
}

// ─── STAGE 3b: Admin rejects ──────────────────────────────────────────────────

/**
 * POST /api/certificates/:id/reject
 * Admin rejects a certificate that is pending_admin.
 */
async function rejectCertificate(req, res, next) {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    const cert = await Certificate.findOne({ certificateId: req.params.id });
    if (!cert) return res.status(404).json({ error: "Certificate not found" });

    if (cert.status !== "pending_admin") {
      return res.status(400).json({
        error: cert.status === "pending_student"
          ? "Student has not confirmed this certificate yet"
          : `Certificate is already ${cert.status}`,
      });
    }

    cert.status = "rejected";
    cert.rejectedBy = req.user._id;
    cert.rejectedAt = new Date();
    cert.rejectionReason = reason.trim();
    cert.rejectedStage = "admin";
    await cert.save();

    await logActivity("CERTIFICATE_REJECTED", {
      userId: req.user._id,
      certificateId: cert.certificateId,
      ipAddress: req.ip,
      details: { reason },
    });

    res.json({ message: "Certificate rejected", certificate: cert });
  } catch (err) {
    next(err);
  }
}

// ─── List / Get ───────────────────────────────────────────────────────────────

/**
 * GET /api/certificates
 */
async function listCertificates(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};

    if (req.user.role === "student") {
      filter.studentId = req.user._id;
    } else if (req.user.role === "institution") {
      filter.institutionId = req.user.institutionId;
    }
    // admin sees all

    if (status) filter.status = status;

    const certificates = await Certificate.find(filter)
      .populate("studentId", "fullName email studentId")
      .populate("institutionId", "name shortName")
      .populate("approvedBy", "fullName")
      .populate("rejectedBy", "fullName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Certificate.countDocuments(filter);

    res.json({ certificates, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/certificates/:id
 */
async function getCertificate(req, res, next) {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.id })
      .populate("studentId", "fullName email studentId")
      .populate("institutionId", "name shortName website")
      .populate("approvedBy", "fullName")
      .populate("rejectedBy", "fullName");

    if (!cert) return res.status(404).json({ error: "Certificate not found" });

    if (req.user.role === "student" && String(cert.studentId._id) !== String(req.user._id)) {
      return res.status(403).json({ error: "Access denied" });
    }

    await logActivity("CERTIFICATE_ACCESSED", {
      userId: req.user._id,
      certificateId: cert.certificateId,
    });

    res.json({ certificate: cert });
  } catch (err) {
    next(err);
  }
}

// ─── Revoke ───────────────────────────────────────────────────────────────────

/**
 * POST /api/certificates/:id/revoke
 */
async function revokeCertificate(req, res, next) {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: "Revocation reason required" });

    const cert = await Certificate.findOne({ certificateId: req.params.id });
    if (!cert) return res.status(404).json({ error: "Certificate not found" });

    if (cert.status === "revoked") return res.status(400).json({ error: "Already revoked" });
    if (cert.status !== "issued") return res.status(400).json({ error: "Only issued certificates can be revoked" });

    if (req.user.role !== "admin" && String(cert.institutionId) !== String(req.user.institutionId)) {
      return res.status(403).json({ error: "Not authorized to revoke" });
    }

    try {
      await revokeCertificateOnChain(cert.certificateId, reason);
    } catch (chainErr) {
      console.error("Blockchain revocation failed:", chainErr.message);
    }

    cert.status = "revoked";
    cert.revocationReason = reason;
    cert.revokedAt = new Date();
    cert.revokedBy = req.user._id;
    await cert.save();

    await logActivity("CERTIFICATE_REVOKED", {
      userId: req.user._id,
      certificateId: cert.certificateId,
      details: { reason },
    });

    res.json({ message: "Certificate revoked", certificate: cert });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  issueCertificate,
  confirmCertificate,
  approveCertificate,
  rejectCertificate,
  listCertificates,
  getCertificate,
  revokeCertificate,
};
