const User = require("../models/User");
const UserAchievement = require("../models/UserAchievement");
const Project = require("../models/Project");
const Hackathon = require("../models/Hackathon");
const Achievement = require("../models/Achievement");

const achievementController = {
  // Get user achievements
  // Update your getUserAchievements function:
async getUserAchievements(req, res) {
  try {
    const userId = req.user._id;

    // Get user data for calculations
    const user = await User.findById(userId);
    const userProjects = await Project.find({
      "builders.user": userId,
    }).populate("hackathon", "title");

    const userHackathons = await Hackathon.find({
      participants: userId,
    });

    // Calculate stats
    const stats = await calculateUserStats(userId, user, userProjects, userHackathons);
    
    // Add debugging
    console.log("User stats:", stats);

    // Define all achievements
    const allAchievements = await getAllAchievements();

    // Evaluate achievements
    const evaluatedAchievements = await evaluateAchievements(userId, stats, allAchievements);
    
    // Add debugging
    console.log("Evaluated first submission:", evaluatedAchievements.find(a => a.id === 'first-submission'));

    // ⭐ AUTO-UNLOCK ACHIEVEMENTS HERE (THIS WAS MISSING!)
    for (const achievement of evaluatedAchievements) {
      if (achievement.unlocked) {
        // Check if already unlocked
        const existingAchievement = await UserAchievement.findOne({
          user: userId,
          achievement: achievement.id,
        });

        if (!existingAchievement) {
          // Auto-unlock new achievement
          console.log("Auto-unlocking achievement:", achievement.name);
          await UserAchievement.create({
            user: userId,
            achievement: achievement.id,
            progress: achievement.total,
            total: achievement.total,
          });
        }
      }
    }

    // Get unlocked achievements (AFTER auto-unlocking)
    const unlockedAchievements = await UserAchievement.find({ user: userId });
    const unlockedIds = unlockedAchievements.map(ua => ua.achievement);
    
    console.log("Unlocked achievement IDs:", unlockedIds);

    // Mark unlocked achievements
    const achievementsWithStatus = evaluatedAchievements.map(achievement => ({
      ...achievement,
      unlocked: unlockedIds.includes(achievement.id),
      unlockedAt: unlockedAchievements.find(ua => ua.achievement === achievement.id)?.unlockedAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        achievements: achievementsWithStatus,
        stats,
        summary: {
          total: achievementsWithStatus.length,
          unlocked: unlockedIds.length,
          percentage: Math.round((unlockedIds.length / achievementsWithStatus.length) * 100),
        },
      },
    });
  } catch (error) {
    console.error("Get achievements error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch achievements",
    });
  }
},

  // Check and unlock achievements (called after user actions)
  async checkAchievements(req, res) {
    try {
      const userId = req.user._id;
      const newAchievements = await checkAndUnlockAchievements(userId);

      res.status(200).json({
        success: true,
        data: {
          newAchievements,
        },
      });
    } catch (error) {
      console.error("Check achievements error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to check achievements",
      });
    }
  },
};

// Helper function to calculate user stats
// Update this function to also check for creator field:
async function calculateUserStats(userId, user, userProjects, userHackathons) {
  // Also get projects where user is the creator
  const createdProjects = await Project.find({ creator: userId });
  
  // Combine both arrays and remove duplicates
  const allUserProjects = [...userProjects, ...createdProjects.filter(cp => 
    !userProjects.some(up => up._id.toString() === cp._id.toString())
  )];
  
  const submittedProjects = allUserProjects.filter(p => p.status === "submitted" || p.status === "judging" || p.status === "judged");
  const rankedProjects = allUserProjects.filter(p => p.rank && p.rank <= 3);
  const technologies = [...new Set(allUserProjects.flatMap(p => p.technologies || []))];
  
  console.log("All user projects:", allUserProjects.length);
  console.log("Submitted projects:", submittedProjects.length);
  
  return {
    profileCompleted: user.profileCompleted,
    hackathonsJoined: userHackathons.length,
    projectsCreated: allUserProjects.length,
    projectsSubmitted: submittedProjects.length,
    prizesWon: rankedProjects.length,
    technologiesUsed: technologies.length,
    skillsListed: user.profile?.skills?.length || 0,
    educationEntries: user.profile?.education?.length || 0,
    achievementsListed: user.profile?.achievements?.length || 0,
    socialLinksAdded: Object.values(user.profile?.socialLinks || {}).filter(Boolean).length,
    daysSinceJoined: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)),
  };
}

// Define all achievements
// Replace the getAllAchievements function with this:
async function getAllAchievements() {
  try {
    const achievements = await Achievement.find({});
    return achievements;
  } catch (error) {
    console.error("Error fetching achievements from database:", error);
    return [];
  }
}

// Evaluate achievements based on stats
// Evaluate achievements based on stats
async function evaluateAchievements(userId, stats, allAchievements) {
  return allAchievements.map(achievement => {
    let progress = 0;
    let unlocked = false;

    // Check if requirements are met
    const requirements = achievement.requirements;
    let metRequirements = 0;
    let totalRequirements = Object.keys(requirements).length;

    // Calculate the total requirement value for progress tracking
    let totalValue = 0;
    for (const [key, value] of Object.entries(requirements)) {
      if (key === 'profileCompleted') {
        totalValue = 1; // Boolean achievements have total of 1
        if (stats[key] === value) {
          progress = 1;
          metRequirements++;
        }
      } else {
        totalValue = Math.max(totalValue, value); // Use the highest requirement value
        const userValue = stats[key] || 0;
        progress = Math.max(progress, Math.min(userValue, value));
        if (userValue >= value) {
          metRequirements++;
        }
      }
    }

    unlocked = metRequirements === totalRequirements;

    return {
      ...achievement.toObject(), // Convert mongoose document to plain object
      progress: unlocked ? totalValue : progress,
      total: totalValue, // Add the total field
      unlocked,
    };
  });
}

// Check and unlock new achievements
async function checkAndUnlockAchievements(userId) {
  try {
    const user = await User.findById(userId);
    const userProjects = await Project.find({
      "builders.user": userId,
    }).populate("hackathon", "title");
    const userHackathons = await Hackathon.find({
      participants: userId,
    });

    const stats = await calculateUserStats(userId, user, userProjects, userHackathons);
    const allAchievements = await getAllAchievements();
    const evaluatedAchievements = await evaluateAchievements(userId, stats, allAchievements);

    const newAchievements = [];

    for (const achievement of evaluatedAchievements) {
      if (achievement.unlocked) {
        // Check if already unlocked
        const existingAchievement = await UserAchievement.findOne({
          user: userId,
          achievement: achievement.id,
        });

        if (!existingAchievement) {
          // Unlock new achievement
          await UserAchievement.create({
            user: userId,
            achievement: achievement.id,
            progress: achievement.total,
            total: achievement.total,
          });
          newAchievements.push(achievement);
        }
      }
    }

    return newAchievements;
  } catch (error) {
    console.error("Check achievements error:", error);
    return [];
  }
}

module.exports = achievementController;