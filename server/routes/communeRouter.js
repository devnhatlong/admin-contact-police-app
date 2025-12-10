const router = require("express").Router();
const ctrls = require("../controllers/communeController");
const { upload } = require('../middlewares/multerMiddleware');
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/import-from-excel", verifyAccessToken, upload.single("file"), ctrls.importFromExcel);
router.post("/", verifyAccessToken , ctrls.createCommune);
router.get("/", verifyAccessToken, ctrls.getCommunes);
router.get("/:id", verifyAccessToken, ctrls.getCommuneById);
router.put("/:id", verifyAccessToken, ctrls.updateCommune);
router.delete("/delete-multiple", verifyAccessToken, ctrls.deleteMultipleCommunes);
router.delete("/:id", verifyAccessToken, ctrls.deleteCommune);

module.exports = router;
