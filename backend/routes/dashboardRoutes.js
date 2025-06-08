const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/auth");

// All routes require authentication
router.use(authMiddleware);

// Dashboard routes
router.get("/participant", dashboardController.getParticipantDashboard);
router.get("/hackathons", dashboardController.getHackathons);
router.post("/hackathons/:hackathonId/join", dashboardController.joinHackathon);

module.exports = router;
