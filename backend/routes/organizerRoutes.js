const express = require("express");
const organizerController = require("../controllers/organizerController");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

router.get("/dashboard", authMiddleware,organizerController.getOrganizerDashboard);
router.get("/analytics", authMiddleware, organizerController.getOrganizerAnalytics);

module.exports = router;