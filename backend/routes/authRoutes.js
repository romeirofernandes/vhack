const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

// Public routes (no auth required)
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes (auth required)
router.post("/authenticate", authMiddleware, authController.authenticate);
router.post("/role", authMiddleware, authController.updateRole);
router.post("/profile", authMiddleware, authController.updateProfile);

module.exports = router;
