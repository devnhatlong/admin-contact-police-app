const router = require("express").Router();
const ctrls = require("../controllers/firebaseOrgUnitController");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
const { upload } = require("../middlewares/multerMiddleware");

router.get("/tree", [verifyAccessToken, isAdmin], ctrls.getOrgUnitTree);
router.get("/", [verifyAccessToken, isAdmin], ctrls.listOrgUnits);
router.post("/import-from-excel", [verifyAccessToken, isAdmin, upload.single("file")], ctrls.importFromExcel);
router.delete("/all", [verifyAccessToken, isAdmin], ctrls.deleteAllOrgUnits);
router.get("/:id", [verifyAccessToken, isAdmin], ctrls.getOrgUnitById);
router.post("/", [verifyAccessToken, isAdmin], ctrls.createOrgUnit);
router.put("/:id", [verifyAccessToken, isAdmin], ctrls.updateOrgUnit);
router.put("/:id/active", [verifyAccessToken, isAdmin], ctrls.setOrgUnitActive);

module.exports = router;
