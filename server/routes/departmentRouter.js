const router = require("express").Router();
const ctrls = require("../controllers/departmentController");
const { upload } = require('../middlewares/multerMiddleware');
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/import-from-excel", verifyAccessToken, upload.single("file"), ctrls.importFromExcel);
router.post("/", verifyAccessToken , ctrls.createDepartment);
router.get("/", verifyAccessToken, ctrls.getDepartments);
router.get("/:id", verifyAccessToken, ctrls.getDepartmentById);
router.put("/:id", verifyAccessToken, ctrls.updateDepartment);
router.delete("/delete-multiple", verifyAccessToken, ctrls.deleteMultipleDepartments);
router.delete("/:id", verifyAccessToken, ctrls.deleteDepartment);

module.exports = router;

// CRUD | Create - Read - Update - Delete | POST - GET - PUT - DELETE
// CREATE (POST) + PUT => req.body
// GET + DELETE => req.query
