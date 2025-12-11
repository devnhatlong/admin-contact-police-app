const router = require("express").Router();
const communeCtrls = require("../controllers/firebaseCommuneController");
const { verifyAccessToken } = require("../middlewares/verifyToken");
const { upload } = require("../middlewares/multerMiddleware");

// Commune CRUD
router.post("/", verifyAccessToken, communeCtrls.createCommune);
router.get("/", verifyAccessToken, communeCtrls.listCommunes);
router.get("/:id", verifyAccessToken, communeCtrls.getCommuneById);
router.put("/:id", verifyAccessToken, communeCtrls.updateCommune);
router.delete("/:id", verifyAccessToken, communeCtrls.deleteCommune);
router.post("/import-from-excel", verifyAccessToken, upload.single("file"), communeCtrls.importFromExcel);

module.exports = router;

