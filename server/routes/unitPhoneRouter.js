const router = require("express").Router();
const ctrls = require("../controllers/firebaseUnitPhoneController");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
const { upload } = require("../middlewares/multerMiddleware");

router.get("/", [verifyAccessToken, isAdmin], ctrls.listUnitPhones);
router.post("/import-from-excel", [verifyAccessToken, isAdmin, upload.single("file")], ctrls.importFromExcel);
router.get("/:id", [verifyAccessToken, isAdmin], ctrls.getUnitPhoneById);
router.post("/", [verifyAccessToken, isAdmin], ctrls.createUnitPhone);
router.put("/:id", [verifyAccessToken, isAdmin], ctrls.updateUnitPhone);
router.put("/:id/active", [verifyAccessToken, isAdmin], ctrls.setUnitPhoneActive);
router.delete("/:id", [verifyAccessToken, isAdmin], ctrls.deleteUnitPhone);

module.exports = router;
