const router = require("express").Router();
const ctrls = require("../controllers/firebaseAppUserPhoneController");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.get("/", [verifyAccessToken, isAdmin], ctrls.listAppUserPhones);
router.post("/", [verifyAccessToken, isAdmin], ctrls.createAppUserPhone);
router.put("/:id", [verifyAccessToken, isAdmin], ctrls.updateAppUserPhone);
router.delete("/:id", [verifyAccessToken, isAdmin], ctrls.deleteAppUserPhone);

module.exports = router;
