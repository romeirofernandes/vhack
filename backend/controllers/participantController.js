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

  // Get available hackathons for participants
  async getHackathons(req, res) {
    try {
      const { status = "all", page = 1, limit = 12 } = req.query;
      const userId = req.user._id;

      let query = { isPublic: true };

      // Filter by status
      if (status !== "all") {
        if (status === "open") {
          query.status = "upcoming";
          query.registrationDeadline = { $gte: new Date() };
        } else if (status === "ongoing") {
          query.status = "ongoing";
        } else if (status === "completed") {
          query.status = "completed";
        }
      }

      const hackathons = await Hackathon.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate("organizer", "displayName profile.company")
        .select(
          "title description status startDate endDate registrationDeadline submissionDeadline maxParticipants participants themes prizes bannerImage"
        );

      // Check which hackathons user has joined
      const hackathonsWithJoinStatus = hackathons.map((hackathon) => ({
        ...hackathon.toObject(),
        isJoined: hackathon.participants.includes(userId),
        participantCount: hackathon.participants.length,
        canJoin:
          hackathon.status === "upcoming" &&
          new Date() <= hackathon.registrationDeadline &&
          (!hackathon.maxParticipants ||
            hackathon.participants.length < hackathon.maxParticipants),
      }));

      const total = await Hackathon.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          hackathons: hackathonsWithJoinStatus,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total,
            hasNext: page * limit < total,
            hasPrev: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Get hackathons error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch hackathons",
      });
    }
  },

  // Join hackathon
  async joinHackathon(req, res) {
    try {
      const { hackathonId } = req.params;
      const userId = req.user._id;

      const hackathon = await Hackathon.findById(hackathonId);
      if (!hackathon) {
        return res.status(404).json({
          success: false,
          error: "Hackathon not found",
        });
      }

      // Check if can join
      if (hackathon.status !== "upcoming") {
        return res.status(400).json({
          success: false,
          error: "Registration is closed for this hackathon",
        });
      }

      if (new Date() > hackathon.registrationDeadline) {
        return res.status(400).json({
          success: false,
          error: "Registration deadline has passed",
        });
      }

      if (hackathon.participants.includes(userId)) {
        return res.status(400).json({
          success: false,
          error: "You have already joined this hackathon",
        });
      }

      if (
        hackathon.maxParticipants &&
        hackathon.participants.length >= hackathon.maxParticipants
      ) {
        return res.status(400).json({
          success: false,
          error: "This hackathon is full",
        });
      }

      // Add participant
      hackathon.participants.push(userId);
      await hackathon.save();

      res.status(200).json({
        success: true,
        message: "Successfully joined hackathon!",
      });
    } catch (error) {
      console.error("Join hackathon error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to join hackathon",
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
      activities.push({
        type: "team",
        message: `${team.leader.equals(userId) ? "Created" : "Joined"} team "${
          team.name
        }" for ${team.hackathon.title}`,
        timestamp: team.createdAt,
        link: `/teams/${team._id}`,
      });
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
      activities.push({
        type: "project",
        message: `Submitted project "${project.title}" to ${project.hackathon.title}`,
        timestamp: project.submittedAt,
        link: `/projects/${project._id}`,
      });
    });

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
