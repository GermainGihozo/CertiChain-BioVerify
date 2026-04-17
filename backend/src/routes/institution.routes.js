const router = require("express").Router();
const {
  createInstitution,
  listInstitutions,
  getInstitution,
  updateInstitution,
  deactivateInstitution,
} = require("../controllers/institution.controller");
const { authenticate, requireRole } = require("../middleware/auth");

router.get("/", listInstitutions);
router.get("/:id", getInstitution);

router.post("/", authenticate, requireRole("admin"), createInstitution);
router.put("/:id", authenticate, requireRole("admin", "institution"), updateInstitution);
router.delete("/:id", authenticate, requireRole("admin"), deactivateInstitution);

module.exports = router;
