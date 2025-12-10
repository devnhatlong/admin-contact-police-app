const router = require("express").Router();
const ctrls = require("../controllers/serverDateController");
const { upload } = require('../middlewares/multerMiddleware');
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.get("/", verifyAccessToken, ctrls.getServerDate);

module.exports = router;
