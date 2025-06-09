const express = require("express");
const router = express.Router();
const profileController = require("../controllers/participantProfileController");
const authMiddleware = require("../middleware/auth");

// Get user profile
router.get("/", authMiddleware, profileController.getProfile);

// Update user profile
router.put("/", authMiddleware, profileController.updateProfile);

module.exports = router;
