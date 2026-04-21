const router = require("express").Router();
const {
  issueCertificate,
  confirmCertificate,
  approveCertificate,
  rejectCertificate,
  listCertificates,
  getCertificate,
  revokeCertificate,
} = require("../controllers/certificate.controller");
const { authenticate, requireRole } = require("../middleware/auth");

router.get("/",    authenticate, listCertificates);
router.get("/:id", authenticate, getCertificate);

// Stage 1 — Institution submits
router.post("/", authenticate, requireRole("institution", "admin"), issueCertificate);

// Stage 2 — Student confirms with biometric (student only)
router.post("/:id/confirm", authenticate, requireRole("student"), confirmCertificate);

// Stage 3 — Admin approves or rejects
router.post("/:id/approve", authenticate, requireRole("admin"), approveCertificate);
router.post("/:id/reject",  authenticate, requireRole("admin"), rejectCertificate);

// Revoke (institution or admin)
router.post("/:id/revoke",  authenticate, requireRole("institution", "admin"), revokeCertificate);

module.exports = router;
