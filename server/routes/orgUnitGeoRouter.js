const router = require("express").Router();
const ctrls = require("../controllers/firebaseOrgUnitGeoController");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
const { upload } = require("../middlewares/multerMiddleware");

router.post("/import-from-excel", [verifyAccessToken, isAdmin, upload.single("file")], ctrls.importFromExcel);
router.get("/:orgUnitId", [verifyAccessToken, isAdmin], ctrls.getByOrgUnit);
router.put("/:orgUnitId", [verifyAccessToken, isAdmin], ctrls.upsertByOrgUnit);

module.exports = router;
