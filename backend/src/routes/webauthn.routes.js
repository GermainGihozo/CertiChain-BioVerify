const router = require("express").Router();
const {
  getRegistrationOptions,
  verifyRegistration,
  getAuthenticationOptions,
  verifyAuthentication,
  removeCredential,
} = require("../controllers/webauthn.controller");
const { authenticate } = require("../middleware/auth");

// Registration (requires login)
router.get("/register/options", authenticate, getRegistrationOptions);
router.post("/register/verify", authenticate, verifyRegistration);

// Authentication (can be called without JWT — uses email in body)
router.post("/authenticate/options", getAuthenticationOptions);
router.post("/authenticate/verify", verifyAuthentication);

// Manage credentials
router.delete("/credentials/:credentialId", authenticate, removeCredential);

module.exports = router;
