const router = require("express").Router();
const communeCtrls = require("../controllers/firebaseCommuneController");
const { verifyAccessToken } = require("../middlewares/verifyToken");

// Commune CRUD
router.post("/", verifyAccessToken, communeCtrls.createCommune);
router.get("/", verifyAccessToken, communeCtrls.listCommunes);
router.get("/:id", verifyAccessToken, communeCtrls.getCommuneById);
router.put("/:id", verifyAccessToken, communeCtrls.updateCommune);
router.delete("/:id", verifyAccessToken, communeCtrls.deleteCommune);

module.exports = router;

