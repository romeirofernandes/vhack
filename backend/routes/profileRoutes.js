const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const authMiddleware = require("../middleware/auth");

// All profile routes require authentication
router.use(authMiddleware);

// Profile CRUD operations
router.get("/", profileController.getProfile);
router.put("/", profileController.updateProfile);
router.put("/settings", profileController.updateSettings);

// Achievement operations
router.post("/achievements", profileController.addAchievement);
router.delete(
  "/achievements/:achievementId",
  profileController.removeAchievement
);

module.exports = router;
