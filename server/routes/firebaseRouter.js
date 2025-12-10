const router = require("express").Router();
const ctrls = require("../controllers/firebaseCommuneController");
const { verifyAccessToken } = require("../middlewares/verifyToken");

router.post("/communes", verifyAccessToken, ctrls.createCommune);
router.get("/communes", verifyAccessToken, ctrls.listCommunes);
router.get("/communes/:id", verifyAccessToken, ctrls.getCommuneById);
router.put("/communes/:id", verifyAccessToken, ctrls.updateCommune);
router.delete("/communes/:id", verifyAccessToken, ctrls.deleteCommune);

module.exports = router;

