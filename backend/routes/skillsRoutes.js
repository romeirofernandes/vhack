const express = require("express");
const skillsController = require("../controllers/skillsController");

const router = express.Router();

router.get("/", skillsController.getSkills);

module.exports = router;
