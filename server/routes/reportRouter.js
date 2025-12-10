const router = require("express").Router();
const ctrls = require("../controllers/reportController");
const { upload, uploadFileToGridFS } = require("../middlewares/multerMiddleware");
const { verifyAccessToken } = require("../middlewares/verifyToken");

router.post("/", verifyAccessToken, upload.single("file"), uploadFileToGridFS, ctrls.createReport);
router.get("/", verifyAccessToken, ctrls.getReports);
router.get("/:id", verifyAccessToken, ctrls.getReportById);
router.delete("/delete-multiple", verifyAccessToken, ctrls.deleteMultipleReports);
router.delete("/:id", verifyAccessToken, ctrls.deleteReport);

module.exports = router;