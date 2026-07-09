const router = require("express").Router();
const ctrls = require("../controllers/firebaseJobPositionController");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.get("/", [verifyAccessToken, isAdmin], ctrls.listJobPositions);
router.get("/:id", [verifyAccessToken, isAdmin], ctrls.getJobPositionById);
router.post("/", [verifyAccessToken, isAdmin], ctrls.createJobPosition);
router.put("/:id", [verifyAccessToken, isAdmin], ctrls.updateJobPosition);
router.put("/:id/active", [verifyAccessToken, isAdmin], ctrls.setJobPositionActive);
router.delete("/all", [verifyAccessToken, isAdmin], ctrls.deleteAllJobPositions);
router.post("/bulk-delete", [verifyAccessToken, isAdmin], ctrls.bulkDeleteJobPositions);
router.delete("/:id", [verifyAccessToken, isAdmin], ctrls.deleteJobPosition);

module.exports = router;
