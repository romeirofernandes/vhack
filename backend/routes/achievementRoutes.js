const express = require("express");
const router = express.Router();
const achievementController = require("../controllers/achievementController");
const authMiddleware = require("../middleware/auth");

// Get user achievements
router.get("/", authMiddleware, achievementController.getUserAchievements);

// Check achievements (call this after user actions)
router.post("/check", authMiddleware, achievementController.checkAchievements);

module.exports = router;