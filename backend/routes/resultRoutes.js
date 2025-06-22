const express = require("express");
const router = express.Router();
const {
  getHackathonResults,
  publishResults,
} = require("../controllers/resultController");
const authMiddleware = require("../middleware/auth");

// Get hackathon results (public after results time)
router.get("/hackathon/:hackathonId", getHackathonResults);

// Publish results early (organizer only)
router.post("/hackathon/:hackathonId/publish", authMiddleware, publishResults);

module.exports = router;
