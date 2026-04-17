const router = require("express").Router();
const {
  issueCertificate,
  listCertificates,
  getCertificate,
  revokeCertificate,
} = require("../controllers/certificate.controller");
const { authenticate, requireRole } = require("../middleware/auth");

router.get("/", authenticate, listCertificates);
router.get("/:id", authenticate, getCertificate);

router.post(
  "/",
  authenticate,
  requireRole("institution", "admin"),
  issueCertificate
);

router.post(
  "/:id/revoke",
  authenticate,
  requireRole("institution", "admin"),
  revokeCertificate
);

module.exports = router;
