const User = require("../models/User");
const UserAchievement = require("../models/Achievement");
const Project = require("../models/Project");
const Hackathon = require("../models/Hackathon");

const achievementController = {
  // Get user achievements
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

      // Define all achievements
      const allAchievements = await getAllAchievements();

      // Evaluate achievements
      const evaluatedAchievements = await evaluateAchievements(userId, stats, allAchievements);

      // Get unlocked achievements
      const unlockedAchievements = await UserAchievement.find({ user: userId });
      const unlockedIds = unlockedAchievements.map(ua => ua.achievement);

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
async function calculateUserStats(userId, user, userProjects, userHackathons) {
  const submittedProjects = userProjects.filter(p => p.status === "submitted" || p.status === "judging" || p.status === "judged");
  const rankedProjects = userProjects.filter(p => p.rank && p.rank <= 3);
  const technologies = [...new Set(userProjects.flatMap(p => p.technologies || []))];
  
  return {
    profileCompleted: user.profileCompleted,
    hackathonsJoined: userHackathons.length,
    projectsCreated: userProjects.length,
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
async function getAllAchievements() {
  return [
    // Beginner achievements
    {
      id: "welcome-aboard",
      name: "Welcome Aboard",
      description: "Created your vHack account",
      icon: "🎉",
      category: "beginner",
      points: 10,
      rarity: "common",
      requirements: { daysSinceJoined: 1 },
      total: 1,
    },
    {
      id: "profile-complete",
      name: "Profile Perfectionist",
      description: "Completed your profile information",
      icon: "📝",
      category: "beginner",
      points: 25,
      rarity: "common",
      requirements: { profileCompleted: true },
      total: 1,
    },
    {
      id: "skill-showcase",
      name: "Skill Showcase",
      description: "Added 5 skills to your profile",
      icon: "🎯",
      category: "beginner",
      points: 15,
      rarity: "common",
      requirements: { skillsListed: 5 },
      total: 5,
    },

    // Participation achievements
    {
      id: "first-hackathon",
      name: "First Steps",
      description: "Joined your first hackathon",
      icon: "🚀",
      category: "participation",
      points: 50,
      rarity: "common",
      requirements: { hackathonsJoined: 1 },
      total: 1,
    },
    {
      id: "hackathon-enthusiast",
      name: "Hackathon Enthusiast",
      description: "Joined 5 hackathons",
      icon: "⚡",
      category: "participation",
      points: 100,
      rarity: "rare",
      requirements: { hackathonsJoined: 5 },
      total: 5,
    },
    {
      id: "hackathon-addict",
      name: "Hackathon Addict",
      description: "Joined 10 hackathons",
      icon: "🔥",
      category: "participation",
      points: 200,
      rarity: "epic",
      requirements: { hackathonsJoined: 10 },
      total: 10,
    },

    // Submission achievements
    {
      id: "first-submission",
      name: "First Submission",
      description: "Submitted your first project",
      icon: "📤",
      category: "submission",
      points: 75,
      rarity: "common",
      requirements: { projectsSubmitted: 1 },
      total: 1,
    },
    {
      id: "prolific-builder",
      name: "Prolific Builder",
      description: "Submitted 5 projects",
      icon: "🏗️",
      category: "submission",
      points: 150,
      rarity: "rare",
      requirements: { projectsSubmitted: 5 },
      total: 5,
    },
    {
      id: "project-master",
      name: "Project Master",
      description: "Created 10 projects",
      icon: "🎨",
      category: "submission",
      points: 100,
      rarity: "rare",
      requirements: { projectsCreated: 10 },
      total: 10,
    },

    // Achievement achievements (meta!)
    {
      id: "winner",
      name: "Winner",
      description: "Won your first prize",
      icon: "🏆",
      category: "expertise",
      points: 300,
      rarity: "epic",
      requirements: { prizesWon: 1 },
      total: 1,
    },
    {
      id: "champion",
      name: "Champion",
      description: "Won 3 prizes",
      icon: "👑",
      category: "expertise",
      points: 500,
      rarity: "legendary",
      requirements: { prizesWon: 3 },
      total: 3,
    },

    // Technology achievements
    {
      id: "tech-explorer",
      name: "Tech Explorer",
      description: "Used 10 different technologies",
      icon: "🔧",
      category: "expertise",
      points: 75,
      rarity: "rare",
      requirements: { technologiesUsed: 10 },
      total: 10,
    },
    {
      id: "polyglot",
      name: "Polyglot",
      description: "Used 20 different technologies",
      icon: "🌐",
      category: "expertise",
      points: 150,
      rarity: "epic",
      requirements: { technologiesUsed: 20 },
      total: 20,
    },

    // Social achievements
    {
      id: "social-butterfly",
      name: "Social Butterfly",
      description: "Added all social links to your profile",
      icon: "🦋",
      category: "collaboration",
      points: 25,
      rarity: "common",
      requirements: { socialLinksAdded: 4 },
      total: 4,
    },

    // Milestone achievements
    {
      id: "veteran",
      name: "Veteran",
      description: "Been part of vHack for 30 days",
      icon: "🎖️",
      category: "milestone",
      points: 100,
      rarity: "rare",
      requirements: { daysSinceJoined: 30 },
      total: 30,
    },
    {
      id: "legend",
      name: "Legend",
      description: "Been part of vHack for 100 days",
      icon: "🌟",
      category: "milestone",
      points: 250,
      rarity: "epic",
      requirements: { daysSinceJoined: 100 },
      total: 100,
    },

    // Special achievements
    {
      id: "well-rounded",
      name: "Well Rounded",
      description: "Added education and achievements to profile",
      icon: "🎓",
      category: "special",
      points: 50,
      rarity: "rare",
      requirements: { educationEntries: 1, achievementsListed: 1 },
      total: 2,
    },
  ];
}

// Evaluate achievements based on stats
async function evaluateAchievements(userId, stats, allAchievements) {
  return allAchievements.map(achievement => {
    let progress = 0;
    let unlocked = false;

    // Check if requirements are met
    const requirements = achievement.requirements;
    let metRequirements = 0;
    let totalRequirements = Object.keys(requirements).length;

    for (const [key, value] of Object.entries(requirements)) {
      if (key === 'profileCompleted') {
        if (stats[key] === value) {
          progress = 1;
          metRequirements++;
        }
      } else {
        const userValue = stats[key] || 0;
        progress = Math.min(userValue, value);
        if (userValue >= value) {
          metRequirements++;
        }
      }
    }

    unlocked = metRequirements === totalRequirements;

    return {
      ...achievement,
      progress: unlocked ? achievement.total : progress,
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