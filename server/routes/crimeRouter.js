const router = require("express").Router();
const ctrls = require("../controllers/crimeController");
const { upload } = require('../middlewares/multerMiddleware');
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/import-from-excel", verifyAccessToken, upload.single("file"), ctrls.importFromExcel);
router.post("/", verifyAccessToken , ctrls.createCrime);
router.get("/", verifyAccessToken, ctrls.getCrimes);
router.get("/:id", verifyAccessToken, ctrls.getCrimeById);
router.put("/:id", verifyAccessToken, ctrls.updateCrime);
router.delete("/delete-multiple", verifyAccessToken, ctrls.deleteMultipleCrimes);
router.delete("/:id", verifyAccessToken, ctrls.deleteCrime);

module.exports = router;
