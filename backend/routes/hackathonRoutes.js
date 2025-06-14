const express = require('express');
const router = express.Router();
const hackathonController = require('../controllers/hackathonController');

// Get all hackathons
router.get('/', hackathonController.getAllHackathons);

// Get all hackathons for an organizer
router.get('/organizer/:organizerName', hackathonController.getOrganizerHackathons);

// Create a new hackathon
router.post('/', hackathonController.createHackathon);

// Get hackathon details by ID
router.get('/:hackathonId', hackathonController.getHackathonById);

module.exports = router; 