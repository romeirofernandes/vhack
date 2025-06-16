const User = require("../models/User");
const Hackathon = require("../models/Hackathon");
const Team = require("../models/Team");
const Project = require("../models/Project");

const dashboardController = {
  // Get participant dashboard data
  async getParticipantDashboard(req, res) {
    try {
      const userId = req.user._id;

      // Get user with basic info
      const user = await User.findById(userId).select(
        "displayName email photoURL profile profileCompleted"
      );

      // Get user's teams
      const userTeams = await Team.find({
        $or: [{ leader: userId }, { "members.user": userId }],
      })
        .populate("hackathon", "title status endDate")
        .populate("project", "title status");

      // Get user's projects
      const userProjects = await Project.find({
        "builders.user": userId,
      })
        .populate("hackathon", "title")
        .populate("team", "name");

      // Get user's registered hackathons
      const registeredHackathons = await Hackathon.find({
        participants: userId,
      }).select("title status startDate endDate");

      // Calculate stats
      const stats = {
        hackathonsJoined: registeredHackathons.length,
        projectsSubmitted: userProjects.filter(
          (p) =>
            p.status === "submitted" ||
            p.status === "judging" ||
            p.status === "judged"
        ).length,
        teamsJoined: userTeams.length,
        achievementsEarned: userProjects.filter((p) => p.rank && p.rank <= 3)
          .length,
      };

      // Get recent activity
      const recentActivity = await getRecentActivity(userId);

      // Get upcoming deadlines
      const upcomingDeadlines = await getUpcomingDeadlines(userId);

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            profile: user.profile,
            profileCompleted: user.profileCompleted,
          },
          stats,
          recentActivity,
          upcomingDeadlines,
          quickStats: {
            teamsCount: userTeams.length,
            ongoingHackathons: registeredHackathons.filter(
              (h) => h.status === "ongoing"
            ).length,
            draftProjects: userProjects.filter((p) => p.status === "draft")
              .length,
          },
        },
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch dashboard data",
      });
    }
  },
};

// Helper functions
async function getRecentActivity(userId) {
  try {
    const activities = [];

    // Get recent team activities
    const recentTeams = await Team.find({
      $or: [{ leader: userId }, { "members.user": userId }],
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("hackathon", "title");

    recentTeams.forEach((team) => {
      // Add null check for hackathon
      if (team.hackathon && team.hackathon.title) {
        activities.push({
          type: "team",
          message: `${
            team.leader.equals(userId) ? "Created" : "Joined"
          } team "${team.name}" for ${team.hackathon.title}`,
          timestamp: team.createdAt,
          link: `/teams/${team._id}`,
        });
      }
    });

    // Get recent project submissions
    const recentProjects = await Project.find({
      "builders.user": userId,
      status: { $in: ["submitted", "judging", "judged"] },
    })
      .sort({ submittedAt: -1 })
      .limit(2)
      .populate("hackathon", "title");

    recentProjects.forEach((project) => {
      // Add null check for hackathon and project
      if (project && project.hackathon && project.hackathon.title) {
        activities.push({
          type: "project",
          message: `Submitted project "${project.title}" to ${project.hackathon.title}`,
          timestamp: project.submittedAt,
          link: `/projects/${project._id}`,
        });
      }
    })

    // Sort by timestamp and return latest 5
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return [];
  }
}

async function getUpcomingDeadlines(userId) {
  try {
    const deadlines = [];

    // Get hackathons user joined with upcoming deadlines
    const userHackathons = await Hackathon.find({
      participants: userId,
      status: { $in: ["upcoming", "ongoing"] },
    }).select("title status registrationDeadline submissionDeadline endDate");

    userHackathons.forEach((hackathon) => {
      const now = new Date();

      if (
        hackathon.status === "upcoming" &&
        hackathon.registrationDeadline > now
      ) {
        deadlines.push({
          hackathon: hackathon.title,
          type: "registration",
          deadline: hackathon.registrationDeadline,
          daysLeft: Math.ceil(
            (hackathon.registrationDeadline - now) / (1000 * 60 * 60 * 24)
          ),
        });
      }

      if (
        hackathon.status === "ongoing" &&
        hackathon.submissionDeadline > now
      ) {
        deadlines.push({
          hackathon: hackathon.title,
          type: "submission",
          deadline: hackathon.submissionDeadline,
          daysLeft: Math.ceil(
            (hackathon.submissionDeadline - now) / (1000 * 60 * 60 * 24)
          ),
        });
      }
    });

    return deadlines
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);
  } catch (error) {
    console.error("Error fetching upcoming deadlines:", error);
    return [];
  }
}

module.exports = dashboardController;
