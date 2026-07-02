const router = require("express").Router();
const ctrls = require("../controllers/firebaseAppUserController");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.get("/", [verifyAccessToken, isAdmin], ctrls.listAppUsers);
router.get("/:id", [verifyAccessToken, isAdmin], ctrls.getAppUserById);
router.post("/", [verifyAccessToken, isAdmin], ctrls.createAppUser);
router.put("/:id", [verifyAccessToken, isAdmin], ctrls.updateAppUser);
router.put("/:id/status", [verifyAccessToken, isAdmin], ctrls.updateAccountStatus);
router.put("/:id/recovery-email", [verifyAccessToken, isAdmin], ctrls.updateRecoveryEmail);
router.post("/:id/send-activation-email", [verifyAccessToken, isAdmin], ctrls.sendActivationEmail);
router.post("/:id/resend-verification-email", [verifyAccessToken, isAdmin], ctrls.resendVerificationEmail);

module.exports = router;
