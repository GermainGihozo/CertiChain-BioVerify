const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");
const Certificate = require("../models/Certificate");
const User = require("../models/User");
const Institution = require("../models/Institution");
const { generateCertificateHash, hashFileBuffer } = require("../utils/certificateHash");
const { issueCertificateOnChain, revokeCertificateOnChain } = require("../utils/blockchain");
const { logActivity } = require("../utils/activityLogger");

/**
 * Generate a unique certificate ID.
 */
function generateCertId(institutionShortName, year) {
  const short = (institutionShortName || "CERT").toUpperCase().replace(/\s+/g, "").slice(0, 6);
  const uid = uuidv4().split("-")[0].toUpperCase();
  return `${short}-${year}-${uid}`;
}

/**
 * POST /api/certificates
 * Institution issues a certificate to a student.
 */
async function issueCertificate(req, res, next) {
  try {
    const {
      studentEmail,
      studentWallet,
      certificateTitle,
      courseName,
      graduationYear,
      grade,
      honors,
    } = req.body;

    // Find student
    const student = await User.findOne({
      $or: [
        { email: studentEmail },
        { walletAddress: studentWallet?.toLowerCase() },
      ],
      role: "student",
    });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Get institution
    const institution = await Institution.findById(req.user.institutionId);
    if (!institution || !institution.isActive) {
      return res.status(403).json({ error: "Institution not active" });
    }

    const certStudentWallet = studentWallet?.toLowerCase() || student.walletAddress;
    if (!certStudentWallet) {
      return res.status(400).json({ error: "Student wallet address required" });
    }

    const certId = generateCertId(institution.shortName, graduationYear);

    // Generate deterministic hash
    const certHash = generateCertificateHash({
      certificateId: certId,
      studentName: student.fullName,
      courseName,
      certificateTitle,
      studentWallet: certStudentWallet,
      institutionWallet: institution.walletAddress,
      graduationYear: Number(graduationYear),
    });

    // Generate QR code pointing to public verification URL
    const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify/${certId}`;
    const qrCode = await QRCode.toDataURL(verifyUrl);

    // Save to DB first
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
      status: "pending",
    });

    // Issue on blockchain
    try {
      const { txHash, blockNumber } = await issueCertificateOnChain({
        certificateId: certId,
        certificateHash: certHash,
        ownerWallet: certStudentWallet,
        studentName: student.fullName,
        courseName,
        certificateTitle,
        graduationYear: Number(graduationYear),
      });

      certificate.blockchainTxHash = txHash;
      certificate.blockNumber = blockNumber;
      certificate.isOnChain = true;
      certificate.status = "issued";
      await certificate.save();
    } catch (chainErr) {
      // Mark as pending — admin can retry
      console.error("Blockchain issuance failed:", chainErr.message);
      certificate.status = "pending";
      await certificate.save();
    }

    await logActivity("CERTIFICATE_ISSUED", {
      userId: req.user._id,
      institutionId: institution._id,
      certificateId: certId,
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: "Certificate issued",
      certificate,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/certificates
 * List certificates — filtered by role.
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
      .populate("institutionId", "name shortName website");

    if (!cert) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    // Students can only see their own
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

/**
 * POST /api/certificates/:id/revoke
 */
async function revokeCertificate(req, res, next) {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ error: "Revocation reason required" });
    }

    const cert = await Certificate.findOne({ certificateId: req.params.id });
    if (!cert) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    if (cert.status === "revoked") {
      return res.status(400).json({ error: "Certificate already revoked" });
    }

    // Only issuing institution or admin
    if (
      req.user.role !== "admin" &&
      String(cert.institutionId) !== String(req.user.institutionId)
    ) {
      return res.status(403).json({ error: "Not authorized to revoke" });
    }

    // Revoke on chain
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
  listCertificates,
  getCertificate,
  revokeCertificate,
};
