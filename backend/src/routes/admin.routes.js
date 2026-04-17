const router = require("express").Router();
const {
  getStats,
  listUsers,
  toggleUser,
  getActivityLogs,
  seedAdmin,
} = require("../controllers/admin.controller");
const { authenticate, requireRole } = require("../middleware/auth");

// Seed admin — only works if no admin exists (no auth required)
router.post("/seed", seedAdmin);

// All other admin routes require auth + admin role
router.use(authenticate, requireRole("admin"));

router.get("/stats", getStats);
router.get("/users", listUsers);
router.put("/users/:id/toggle", toggleUser);
router.get("/activity", getActivityLogs);

module.exports = router;
