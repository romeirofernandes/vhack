const express = require('express');
const router = express.Router();
const hackathonController = require('../controllers/hackathonController');
const authMiddleware = require('../middleware/auth');
const Hackathon = require("../models/Hackathon")
const chatController = require('../controllers/chatController');

router.get('/published', authMiddleware, async (req, res) => {
  try {
    const hackathons = await Hackathon.find({ 
      status: 'published' 
    })
    .populate('organizerId', 'displayName email')
    .populate('judges', 'displayName email')
    .select('-invitedJudges -rejectionReason')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      hackathons
    });
  } catch (error) {
    console.error('Error fetching published hackathons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hackathons'
    });
  }
});

// Public routes
router.get('/', hackathonController.getAllHackathons);
router.get('/:hackathonId', hackathonController.getHackathonById);

// Protected routes
// Supports multi-stage hackathons (multiStage, rounds)
router.post('/create', authMiddleware, hackathonController.createHackathon);
router.get('/my/hackathons', authMiddleware, hackathonController.getOrganizerHackathons);
router.put('/:hackathonId', authMiddleware, hackathonController.updateHackathon);
router.delete('/:hackathonId', authMiddleware, hackathonController.deleteHackathon);

router.get('/judge/assigned', authMiddleware, hackathonController.getAssignedHackathons);

router.get('/:hackathonId/chat-messages', chatController.getChatHistory);

router.get('/:hackathonId/announcements', hackathonController.getAnnouncements);
router.post('/:hackathonId/announcements', authMiddleware, hackathonController.addAnnouncement);

module.exports = router; 