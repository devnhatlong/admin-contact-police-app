const router = require("express").Router();
const ctrls = require("../controllers/provinceController");
const { upload } = require('../middlewares/multerMiddleware');
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/import-from-excel", verifyAccessToken, upload.single("file"), ctrls.importFromExcel);
router.post("/", verifyAccessToken , ctrls.createProvince);
router.get("/", verifyAccessToken, ctrls.getProvinces);
router.get("/:id", verifyAccessToken, ctrls.getProvinceById);
router.put("/:id", verifyAccessToken, ctrls.updateProvince);
router.delete("/delete-multiple", verifyAccessToken, ctrls.deleteMultipleProvinces);
router.delete("/:id", verifyAccessToken, ctrls.deleteProvince);

module.exports = router;
