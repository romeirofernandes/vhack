const express = require("express");
const router = express.Router();
const judgeController = require("../controllers/judgeController");
const authMiddleware = require("../middleware/auth");

// Get all judges
router.get("/", authMiddleware, judgeController.getAllJudges);

// Search users
router.get("/search", authMiddleware, judgeController.searchUsers);

// Send judge invite
router.post("/hackathon/:hackathonId/invite", authMiddleware, judgeController.sendJudgeInvite);

// Get judge dashboard
router.get("/dashboard", authMiddleware, judgeController.getJudgeDashboard);

// Get judge analytics
router.get("/analytics", authMiddleware, judgeController.getJudgeAnalytics);

// Get judge invitations
router.get('/invitations', authMiddleware, judgeController.getJudgeInvitations);

// Respond to an invitation
router.post('/invitations/:hackathonId/respond', authMiddleware, judgeController.respondToInvitation);

module.exports = router; 