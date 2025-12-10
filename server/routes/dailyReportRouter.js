const router = require("express").Router();
const ctrls = require("../controllers/dailyReportController");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/", verifyAccessToken, ctrls.createDailyReport);
router.get("/next-number", verifyAccessToken, ctrls.getNextReportNumber);
router.get("/", verifyAccessToken, ctrls.getDailyReports);
router.get("/user/:userId", verifyAccessToken, ctrls.getDailyReportsByUser);
router.delete("/delete-multiple", verifyAccessToken, ctrls.deleteMultipleDailyReports);
// History routes - phải đặt trước /:id để tránh conflict
router.get("/history-detail/:id", verifyAccessToken, ctrls.getHistoryDetailByHistoryId);
router.get("/:id/history", verifyAccessToken, ctrls.getHistoryByDailyReportId);
router.get("/:id", verifyAccessToken, ctrls.getDailyReportById);
router.put("/:id", verifyAccessToken, ctrls.updateDailyReport);
router.delete("/:id", verifyAccessToken, ctrls.deleteDailyReport);

module.exports = router;