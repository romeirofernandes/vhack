const User = require("../models/User");

const profileController = {
  // Get user profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user._id).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        data: user,
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
      const {
        displayName,
        firstName,
        lastName,
        bio,
        location,
        company,
        jobTitle,
        experience,
        skills,
        education,
        socialLinks,
        achievements,
      } = req.body;

      const profileData = {
        firstName,
        lastName,
        bio,
        location,
        company,
        jobTitle,
        experience,
        skills: skills || [],
        education: education || [],
        socialLinks: socialLinks || {},
        achievements: achievements || [],
      };

      console.log("Profile data being saved:", profileData);

      // Update the user
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          displayName,
          profile: profileData,
          profileCompleted: true,
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update profile",
      });
    }
  },
};

module.exports = profileController;
