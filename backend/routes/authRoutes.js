const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

// Destructure the authController methods
const { register, login, verifyToken } = authController;

// Public routes (no auth required)
router.post("/register", register);
router.post("/login", login);

// Protected routes (auth required)
router.post("/authenticate", authMiddleware, authController.authenticate);
router.post("/role", authMiddleware, authController.updateRole);
router.post("/profile", authMiddleware, authController.updateProfile);

// Add this route
router.post("/verify-token", verifyToken);

module.exports = router;
