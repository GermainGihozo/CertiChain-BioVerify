const Certificate = require("../models/Certificate");
const { verifyCertificateOnChain, getCertificateFromChain } = require("../utils/blockchain");
const { generateCertificateHash, hashFileBuffer } = require("../utils/certificateHash");
const { logActivity } = require("../utils/activityLogger");

/**
 * GET /api/verify/:certId
 * Public endpoint — verify by certificate ID.
 */
async function verifyById(req, res, next) {
  try {
    const { certId } = req.params;

    // Look up in DB
    const cert = await Certificate.findOne({ certificateId: certId.toUpperCase() })
      .populate("institutionId", "name shortName website country");

    if (!cert) {
      return res.status(404).json({
        valid: false,
        error: "Certificate not found in database",
      });
    }

    // Check blockchain
    let blockchainValid = false;
    let blockchainData = null;

    try {
      const result = await verifyCertificateOnChain(certId.toUpperCase(), cert.certificateHash);
      blockchainValid = result.valid;
      blockchainData = result;
    } catch (chainErr) {
      console.error("Blockchain check failed:", chainErr.message);
    }

    const isValid = cert.status === "issued" && blockchainValid;

    await logActivity("CERTIFICATE_VERIFIED", {
      certificateId: certId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      success: isValid,
      details: { method: "id" },
    });

    res.json({
      valid: isValid,
      status: cert.status,
      blockchainVerified: blockchainValid,
      certificate: {
        certificateId: cert.certificateId,
        studentName: cert.studentName,
        certificateTitle: cert.certificateTitle,
        courseName: cert.courseName,
        graduationYear: cert.graduationYear,
        grade: cert.grade,
        honors: cert.honors,
        issuedAt: cert.createdAt,
        institutionName: cert.institutionName,
        institution: cert.institutionId,
        blockchainTxHash: cert.blockchainTxHash,
        isRevoked: cert.status === "revoked",
        revocationReason: cert.revocationReason,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/verify/hash
 * Verify by providing certificate fields (recomputes hash).
 */
async function verifyByHash(req, res, next) {
  try {
    const {
      certificateId,
      studentName,
      courseName,
      certificateTitle,
      studentWallet,
      institutionWallet,
      graduationYear,
    } = req.body;

    const hash = generateCertificateHash({
      certificateId,
      studentName,
      courseName,
      certificateTitle,
      studentWallet: studentWallet?.toLowerCase(),
      institutionWallet: institutionWallet?.toLowerCase(),
      graduationYear: Number(graduationYear),
    });

    const cert = await Certificate.findOne({ certificateHash: hash });

    if (!cert) {
      return res.json({ valid: false, error: "No matching certificate found" });
    }

    let blockchainValid = false;
    try {
      const result = await verifyCertificateOnChain(cert.certificateId, hash);
      blockchainValid = result.valid;
    } catch (_) {}

    res.json({
      valid: cert.status === "issued" && blockchainValid,
      blockchainVerified: blockchainValid,
      certificateId: cert.certificateId,
      status: cert.status,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/verify/file
 * Verify by uploading a certificate file — checks hash.
 */
async function verifyByFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileHash = hashFileBuffer(req.file.buffer);

    // Look up by hash
    const cert = await Certificate.findOne({ certificateHash: fileHash });

    if (!cert) {
      return res.json({
        valid: false,
        error: "Certificate hash not found — file may be tampered",
      });
    }

    let blockchainValid = false;
    try {
      const result = await verifyCertificateOnChain(cert.certificateId, fileHash);
      blockchainValid = result.valid;
    } catch (_) {}

    res.json({
      valid: cert.status === "issued" && blockchainValid,
      blockchainVerified: blockchainValid,
      certificateId: cert.certificateId,
      studentName: cert.studentName,
      institutionName: cert.institutionName,
      status: cert.status,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { verifyById, verifyByHash, verifyByFile };
