const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const { getCredentials, updateProfile, changePassword } = require("../controllers/user.controller");

// All routes require authentication
router.use(authenticate);

router.get("/credentials", getCredentials);
router.put("/profile", updateProfile);
router.put("/password", changePassword);

module.exports = router;
