const router = require("express").Router();
const contactCtrls = require("../controllers/firebaseContactController");
const { verifyAccessToken } = require("../middlewares/verifyToken");
const { upload } = require("../middlewares/multerMiddleware");

// Contact CRUD
router.post("/", verifyAccessToken, contactCtrls.createContact);
router.get("/", verifyAccessToken, contactCtrls.listContacts);
router.get("/:id", verifyAccessToken, contactCtrls.getContactById);
router.put("/:id", verifyAccessToken, contactCtrls.updateContact);
router.delete("/:id", verifyAccessToken, contactCtrls.deleteContact);
router.post("/import-from-excel", verifyAccessToken, upload.single("file"), contactCtrls.importFromExcel);

module.exports = router;

