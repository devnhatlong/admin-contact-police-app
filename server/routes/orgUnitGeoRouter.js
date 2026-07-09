const router = require("express").Router();
const ctrls = require("../controllers/firebaseOrgUnitGeoController");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.get("/:orgUnitId", [verifyAccessToken, isAdmin], ctrls.getByOrgUnit);
router.put("/:orgUnitId", [verifyAccessToken, isAdmin], ctrls.upsertByOrgUnit);

module.exports = router;
