const router = require("express").Router();
const { body } = require("express-validator");
const { register, login, getMe, updateWallet } = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth");

router.post(
  "/register",
  [
    body("fullName").trim().notEmpty().withMessage("Full name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  login
);

router.get("/me", authenticate, getMe);
router.put("/update-wallet", authenticate, updateWallet);

module.exports = router;
