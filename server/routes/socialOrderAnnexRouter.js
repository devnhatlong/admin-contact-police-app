const router = require("express").Router();
const ctrls = require("../controllers/socialOrderAnnexController");
const { verifyAccessToken } = require("../middlewares/verifyToken");

// Routes cho phụ lục vụ việc trật tự xã hội
router.get("/", verifyAccessToken, ctrls.getAnnexes); // Lấy danh sách phụ lục
router.post("/", verifyAccessToken, ctrls.createAnnex); // Tạo mới phụ lục
router.get("/:id", verifyAccessToken, ctrls.getAnnexById); // Lấy thông tin phụ lục theo ID
router.get("/social-order/:id", verifyAccessToken, ctrls.getAnnexBySocialOrderId); // Lấy thông tin phụ lục theo ID
router.put("/:id", verifyAccessToken, ctrls.updateAnnex); // Cập nhật phụ lục
router.delete("/:id", verifyAccessToken, ctrls.deleteAnnex); // Xóa phụ lục

// history
router.get("/:id/history-detail", verifyAccessToken, ctrls.getHistoryDetailByHistoryId);

module.exports = router;