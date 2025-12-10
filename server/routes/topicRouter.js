const router = require("express").Router();
const ctrls = require("../controllers/topicController");
const { upload } = require('../middlewares/multerMiddleware');
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/import-from-excel", verifyAccessToken, upload.single("file"), ctrls.importFromExcel);
router.post("/", verifyAccessToken , ctrls.createTopic);
router.get("/", verifyAccessToken, ctrls.getTopics);
router.get("/:id", verifyAccessToken, ctrls.getTopicById);
router.put("/:id", verifyAccessToken, ctrls.updateTopic);
router.delete("/delete-multiple", verifyAccessToken, ctrls.deleteMultipleTopics);
router.delete("/:id", verifyAccessToken, ctrls.deleteTopic);

module.exports = router;
