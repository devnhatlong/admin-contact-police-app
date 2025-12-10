const router = require("express").Router();
const ctrls = require("../controllers/criminalController");
const { verifyAccessToken } = require("../middlewares/verifyToken");

// Routes cho đối tượng tội phạm
router.get("/", verifyAccessToken, ctrls.getCriminals); // Lấy danh sách đối tượng tội phạm
router.post("/", verifyAccessToken, ctrls.createCriminal); // Tạo mới đối tượng tội phạm
router.get("/:id", verifyAccessToken, ctrls.getCriminalById); // Lấy thông tin đối tượng tội phạm theo ID
router.get("/social-order/:id", verifyAccessToken, ctrls.getCriminalBySocialOrderId); // Lấy thông tin phụ lục theo ID
router.put("/:id", verifyAccessToken, ctrls.updateCriminal); // Cập nhật đối tượng tội phạm
router.delete("/:id", verifyAccessToken, ctrls.deleteCriminal); // Xóa đối tượng tội phạm

// history
router.get("/:id/history-detail", verifyAccessToken, ctrls.getHistoryDetailByHistoryId);

module.exports = router;