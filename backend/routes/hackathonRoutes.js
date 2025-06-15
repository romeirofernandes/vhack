const express = require('express');
const router = express.Router();
const hackathonController = require('../controllers/hackathonController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', hackathonController.getAllHackathons);
router.get('/:hackathonId', hackathonController.getHackathonById);

// Protected routes
router.post('/create', authMiddleware, hackathonController.createHackathon);
router.get('/organizer/hackathons', authMiddleware, hackathonController.getOrganizerHackathons);
router.put('/:hackathonId', authMiddleware, hackathonController.updateHackathon);
router.delete('/:hackathonId', authMiddleware, hackathonController.deleteHackathon);

module.exports = router; 