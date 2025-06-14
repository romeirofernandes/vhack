const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

// Get all judges
router.get("/judges", authMiddleware, userController.getAllJudges);

// Search users
router.get("/search", authMiddleware, userController.searchUsers);

// Send judge invite
router.post("/hackathon/:hackathonId/invite", authMiddleware, userController.sendJudgeInvite);

module.exports = router; 