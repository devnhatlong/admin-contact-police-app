const router = require("express").Router();
const ctrls = require("../controllers/reportTypeController");
const { upload } = require('../middlewares/multerMiddleware');
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/import-from-excel", verifyAccessToken, upload.single("file"), ctrls.importFromExcel);
router.post("/", verifyAccessToken , ctrls.createReportType);
router.get("/", verifyAccessToken, ctrls.getReportTypes);
router.get("/:id", verifyAccessToken, ctrls.getReportTypeById);
router.put("/:id", verifyAccessToken, ctrls.updateReportType);
router.delete("/delete-multiple", verifyAccessToken, ctrls.deleteMultipleReportTypes);
router.delete("/:id", verifyAccessToken, ctrls.deleteReportType);

module.exports = router;
