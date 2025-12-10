const router = require("express").Router();
const ctrls = require("../controllers/dailyReportAnnexController");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/", verifyAccessToken, ctrls.createDailyReportAnnex);
router.get("/", verifyAccessToken, ctrls.getDailyReportAnnexes);
router.get("/statistics-by-period", verifyAccessToken, ctrls.getDailyReportAnnexStatisticsByPeriod);
router.get("/statistics-comparison", verifyAccessToken, ctrls.getDailyReportAnnexStatisticsWithComparison);
router.get("/by-user-date", verifyAccessToken, ctrls.getDailyReportAnnexByUserAndDate);
router.get("/by-report/:reportId", verifyAccessToken, ctrls.getDailyReportAnnexByReportId);
router.get("/:id", verifyAccessToken, ctrls.getDailyReportAnnexById);
router.put("/:id", verifyAccessToken, ctrls.updateDailyReportAnnex);
router.delete("/delete-multiple", verifyAccessToken, ctrls.deleteMultipleDailyReportAnnexes);
router.delete("/:id", verifyAccessToken, ctrls.deleteDailyReportAnnex);

module.exports = router;