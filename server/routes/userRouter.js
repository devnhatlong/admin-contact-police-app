const router = require("express").Router();
const ctrls = require("../controllers/firebaseUserController");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

// Authentication routes
router.post("/login", ctrls.login);
router.post("/register", ctrls.createUser);
router.post("/refreshtoken", ctrls.refreshAccessToken);
router.post("/logout", ctrls.logout);
// router.get("/forgot-password", ctrls.forgotPassword); // Đã loại bỏ
// router.put("/reset-password", ctrls.resetPassword); // Đã loại bỏ

// User profile routes (authenticated users)
router.get("/profile", verifyAccessToken, ctrls.getUser);
router.put("/profile", verifyAccessToken, ctrls.updateUser);
router.put("/change-password", verifyAccessToken, ctrls.changePasswordByUser);

// Admin CRUD routes
router.post("/", [verifyAccessToken, isAdmin], ctrls.createUser);
router.get("/", [verifyAccessToken, isAdmin], ctrls.getUsers);
router.get("/:id", [verifyAccessToken, isAdmin], ctrls.getUserById);
router.put("/:id", [verifyAccessToken, isAdmin], ctrls.updateUserByAdmin);
router.delete("/:id", [verifyAccessToken, isAdmin], ctrls.deleteUser);
router.delete("/", [verifyAccessToken, isAdmin], ctrls.deleteMultipleUsers);
router.put("/:id/change-password", [verifyAccessToken, isAdmin], ctrls.changePasswordByAdmin);

module.exports = router;

// CRUD | Create - Read - Update - Delete | POST - GET - PUT - DELETE
// CREATE (POST) + PUT => req.body
// GET + DELETE => req.query
