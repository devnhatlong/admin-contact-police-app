const router = require("express").Router();
const contactCtrls = require("../controllers/firebaseContactController");
const { verifyAccessToken } = require("../middlewares/verifyToken");

// Contact CRUD
router.post("/", verifyAccessToken, contactCtrls.createContact);
router.get("/", verifyAccessToken, contactCtrls.listContacts);
router.get("/:id", verifyAccessToken, contactCtrls.getContactById);
router.put("/:id", verifyAccessToken, contactCtrls.updateContact);
router.delete("/:id", verifyAccessToken, contactCtrls.deleteContact);

module.exports = router;

