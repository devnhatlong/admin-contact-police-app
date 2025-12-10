const router = require("express").Router();
const ctrls = require("../controllers/fieldOfWorkController");
const { upload } = require('../middlewares/multerMiddleware');
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/import-from-excel", verifyAccessToken, upload.single("file"), ctrls.importFromExcel);
router.post("/", verifyAccessToken , ctrls.createFieldOfWork);
router.get("/by-category", verifyAccessToken, ctrls.getFieldOfWorksByCategory);
router.get("/", verifyAccessToken, ctrls.getFieldOfWorks);
router.get("/:id", verifyAccessToken, ctrls.getFieldOfWorkById);
router.put("/:id", verifyAccessToken, ctrls.updateFieldOfWork);
router.put("/update-field-department/:id", verifyAccessToken, ctrls.updateFieldDepartment);
router.delete("/delete-multiple", verifyAccessToken, ctrls.deleteMultipleFieldOfWorks);
router.delete("/:id", verifyAccessToken, ctrls.deleteFieldOfWork);

module.exports = router;

