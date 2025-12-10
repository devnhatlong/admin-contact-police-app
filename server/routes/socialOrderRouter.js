const router = require("express").Router();
const ctrls = require("../controllers/socialOrderController");
const { upload } = require('../middlewares/multerMiddleware');
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

// CRUD
router.post("/", verifyAccessToken , ctrls.createSocialOrder);
router.get("/", verifyAccessToken, ctrls.getSocialOrders);
router.get("/:id", verifyAccessToken, ctrls.getSocialOrderById);
router.put("/:id", verifyAccessToken, ctrls.updateSocialOrder);
router.delete("/delete-multiple", verifyAccessToken, ctrls.deleteMultipleSocialOrders);
router.delete("/:id", verifyAccessToken, ctrls.deleteSocialOrder);

// Gửi/phê duyệt/trả lại
router.put("/:id/send-to-department", verifyAccessToken, ctrls.sendToDepartment); // Xã gửi lên Phòng
router.put("/:id/approve", [verifyAccessToken, isAdmin], ctrls.approveSocialOrder); // Phòng phê duyệt
router.put("/:id/return", [verifyAccessToken, isAdmin], ctrls.returnSocialOrder); // Phòng trả lại
router.put("/:id/send-to-ministry", [verifyAccessToken, isAdmin], ctrls.sendToMinistry); // Phòng gửi lên Bộ

// History
router.get("/:id/history", verifyAccessToken, ctrls.getHistoryBySocialOrderId);
router.get("/:id/history-detail", verifyAccessToken, ctrls.getHistoryDetailByHistoryId);

module.exports = router;