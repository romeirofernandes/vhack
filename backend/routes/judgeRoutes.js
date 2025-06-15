const express = require("express");
const router = express.Router();
const userController = require("../controllers/judgeController");
const authMiddleware = require("../middleware/auth");

// Get all judges
router.get("/", authMiddleware, userController.getAllJudges);

// Search users
router.get("/search", authMiddleware, userController.searchUsers);

// Send judge invite
router.post("/hackathon/:hackathonId/invite", authMiddleware, userController.sendJudgeInvite);

// Add these routes to your userRoutes.js

// Get judge invitations
router.get('/invitations', authMiddleware, userController.getJudgeInvitations);

// Respond to an invitation
router.post('/invitations/:hackathonId/respond', authMiddleware, userController.respondToInvitation);

module.exports = router; 