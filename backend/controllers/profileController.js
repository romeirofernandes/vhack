const User = require("../models/User");

const profileController = {
  // Get user profile
  async getProfile(req, res) {
    try {
      const userId = req.user._id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        data: {
          profile: user.profile || {},
          settings: user.settings || {},
          profileCompleted: user.profileCompleted,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch profile",
      });
    }
  },

  // Update user profile
  async updateProfile(req, res) {
    try {
      const userId = req.user._id;
      const profileData = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Initialize profile if it doesn't exist
      if (!user.profile) {
        user.profile = {};
      }

      // Update profile fields
      Object.keys(profileData).forEach((key) => {
        if (profileData[key] !== undefined) {
          user.profile[key] = profileData[key];
        }
      });

      // Update display name if first/last name changed
      if (profileData.firstName || profileData.lastName) {
        const firstName = profileData.firstName || user.profile.firstName || "";
        const lastName = profileData.lastName || user.profile.lastName || "";
        user.displayName = `${firstName} ${lastName}`.trim();
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
          profile: user.profile,
          profileCompleted: user.profileCompleted,
          displayName: user.displayName,
        },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update profile",
      });
    }
  },

  // Update user settings
  async updateSettings(req, res) {
    try {
      const userId = req.user._id;
      const settingsData = req.body;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Initialize settings if it doesn't exist
      if (!user.settings) {
        user.settings = {};
      }

      // Update settings
      Object.keys(settingsData).forEach((key) => {
        if (settingsData[key] !== undefined) {
          user.settings[key] = settingsData[key];
        }
      });

      await user.save();

      res.status(200).json({
        success: true,
        message: "Settings updated successfully",
        data: {
          settings: user.settings,
        },
      });
    } catch (error) {
      console.error("Update settings error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update settings",
      });
    }
  },

  // Add achievement
  async addAchievement(req, res) {
    try {
      const userId = req.user._id;
      const { title, description, date, type } = req.body;

      if (!title || !description || !type) {
        return res.status(400).json({
          success: false,
          error: "Title, description, and type are required",
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      const achievement = {
        title,
        description,
        date: date || new Date(),
        type,
      };

      if (!user.profile) {
        user.profile = {};
      }
      if (!user.profile.achievements) {
        user.profile.achievements = [];
      }

      user.profile.achievements.push(achievement);
      await user.save();

      const newAchievement =
        user.profile.achievements[user.profile.achievements.length - 1];

      res.status(201).json({
        success: true,
        message: "Achievement added successfully",
        data: {
          achievement: newAchievement,
        },
      });
    } catch (error) {
      console.error("Add achievement error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to add achievement",
      });
    }
  },

  // Remove achievement
  async removeAchievement(req, res) {
    try {
      const userId = req.user._id;
      const { achievementId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      if (!user.profile?.achievements) {
        return res.status(404).json({
          success: false,
          error: "Achievement not found",
        });
      }

      const initialLength = user.profile.achievements.length;
      user.profile.achievements = user.profile.achievements.filter(
        (achievement) => achievement._id.toString() !== achievementId
      );

      if (user.profile.achievements.length === initialLength) {
        return res.status(404).json({
          success: false,
          error: "Achievement not found",
        });
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: "Achievement removed successfully",
      });
    } catch (error) {
      console.error("Remove achievement error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to remove achievement",
      });
    }
  },
};

module.exports = profileController;
