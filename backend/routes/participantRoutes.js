const express = require("express");
const router = express.Router();
const participantController = require("../controllers/participantController");
const authMiddleware = require("../middleware/auth");

// All routes require authentication
router.use(authMiddleware);

// Dashboard routes
router.get("/dashboard", participantController.getParticipantDashboard);
router.get("/analytics", authMiddleware, participantController.getParticipantAnalytics);

module.exports = router;
