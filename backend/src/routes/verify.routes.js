const router = require("express").Router();
const multer = require("multer");
const { verifyById, verifyByHash, verifyByFile } = require("../controllers/verify.controller");

// File upload in memory (no disk storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// Public routes — no auth required
router.get("/:certId", verifyById);
router.post("/hash", verifyByHash);
router.post("/file", upload.single("certificate"), verifyByFile);

module.exports = router;
