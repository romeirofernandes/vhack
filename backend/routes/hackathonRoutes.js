const express = require('express');
const router = express.Router();
const hackathonController = require('../controllers/hackathonController');

// Get all hackathons
router.get('/', hackathonController.getAllHackathons);

// Get all hackathons for an organizer
router.get('/organizer/:organizerName', (req, res, next) => {
    console.log('Route hit for organizer:', req.params.organizerName); // Debug log
    next();
}, hackathonController.getOrganizerHackathons);

// Create a new hackathon
router.post('/', hackathonController.createHackathon);

module.exports = router; 