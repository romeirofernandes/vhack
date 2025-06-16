const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");
const auth = require("../middleware/auth");

router.post("/", auth, teamController.createTeam);
router.post("/join", auth, teamController.joinTeam);
router.get("/hackathon/:hackathonId", auth, teamController.getTeamsForHackathon);
router.get("/hackathon/:hackathonId/my", auth, teamController.getMyTeamForHackathon);

module.exports = router;