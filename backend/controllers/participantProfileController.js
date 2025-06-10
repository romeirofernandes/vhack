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

      // Find the current user first
      const currentUser = await User.findById(req.user._id);
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      // Clean and validate achievements
      const cleanAchievements = Array.isArray(achievements)
        ? achievements.map((achievement) => ({
            title: String(achievement.title || ""),
            description: String(achievement.description || ""),
            type: String(achievement.type || ""),
            date: String(achievement.date || ""),
            id: Number(achievement.id || Date.now()),
          }))
        : [];

      // Create the complete profile object
      const newProfile = {
        firstName: String(firstName || ""),
        lastName: String(lastName || ""),
        bio: String(bio || ""),
        location: String(location || ""),
        company: String(company || ""),
        jobTitle: String(jobTitle || ""),
        experience: String(experience || ""),
        skills: Array.isArray(skills)
          ? skills.map((skill) => String(skill))
          : [],
        education: Array.isArray(education) ? education : [],
        socialLinks: {
          github: String(socialLinks?.github || ""),
          linkedin: String(socialLinks?.linkedin || ""),
          portfolio: String(socialLinks?.portfolio || ""),
          twitter: String(socialLinks?.twitter || ""),
        },
        achievements: cleanAchievements,
        expertise: currentUser.profile?.expertise || [],
        organization: currentUser.profile?.organization || "",
        yearsOfExperience: currentUser.profile?.yearsOfExperience || "",
        website: currentUser.profile?.website || "",
        position: currentUser.profile?.position || "",
      };

      // Update the user using save() method instead of findByIdAndUpdate
      currentUser.displayName = displayName || currentUser.displayName;
      currentUser.profile = newProfile;
      currentUser.profileCompleted = true;
      currentUser.updatedAt = new Date();

      const updatedUser = await currentUser.save();

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
          ...updatedUser.toObject(),
          password: undefined,
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
};

module.exports = profileController;
