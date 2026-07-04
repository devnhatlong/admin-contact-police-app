const router = require("express").Router();
const ctrls = require("../controllers/firebaseOrgUnitController");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.get("/tree", [verifyAccessToken, isAdmin], ctrls.getOrgUnitTree);
router.get("/", [verifyAccessToken, isAdmin], ctrls.listOrgUnits);
router.post("/sync-from-communes", [verifyAccessToken, isAdmin], ctrls.syncFromCommunes);
router.get("/:id", [verifyAccessToken, isAdmin], ctrls.getOrgUnitById);
router.post("/", [verifyAccessToken, isAdmin], ctrls.createOrgUnit);
router.put("/:id", [verifyAccessToken, isAdmin], ctrls.updateOrgUnit);
router.put("/:id/active", [verifyAccessToken, isAdmin], ctrls.setOrgUnitActive);

module.exports = router;
