const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");
const User = require("../models/User"); // Import the User model

// Destructure the authController methods
const { register, login, verifyToken } = authController;

// Public routes (no auth required)
router.post("/register", register);
router.post("/login", login);

// Protected routes (auth required)
router.post("/authenticate", authMiddleware, authController.authenticate);
router.post("/role", authMiddleware, authController.updateRole);
router.post("/profile", authMiddleware, authController.updateProfile);

// Add this route
router.post("/verify-token", verifyToken);

router.get('/mongo-id', authMiddleware, async (req, res) => {
  try {
    // Get Firebase UID from the request (however your middleware provides it)
    const firebaseUid = req.user.uid || req.user.firebaseUid || req.user._id;
    
    // Find user by Firebase UID
    const user = await User.findOne({ firebaseUid: firebaseUid });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Just return the MongoDB _id
    res.json({
      success: true,
      mongoId: user._id.toString()
    });
  } catch (error) {
    console.error('Error getting mongo ID:', error);
    res.status(500).json({ success: false, error: 'Error getting mongo ID' });
  }
});

module.exports = router;
