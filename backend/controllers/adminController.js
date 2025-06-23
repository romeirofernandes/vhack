const Hackathon = require("../models/Hackathon");
const User = require("../models/User");
const Team = require("../models/Team");
const Project = require("../models/Project");

// Get dashboard stats for admin
const getAdminDashboard = async (req, res) => {
  try {
    // Get all hackathons with proper population
    const hackathons = await Hackathon.find()
      .populate("organizerId", "displayName email")
      .sort({ createdAt: -1 });

    // Get all users count by role
    const totalUsers = await User.countDocuments();
    const totalParticipants = await User.countDocuments({
      role: "participant",
    });
    const totalOrganizers = await User.countDocuments({ role: "organizer" });
    const totalJudges = await User.countDocuments({ role: "judge" });

    // Get all teams and projects for additional metrics
    const allTeams = await Team.find().populate("members.user", "displayName");
    const allProjects = await Project.find().populate("hackathon", "title");

    // Calculate basic stats
    const stats = {
      totalHackathons: hackathons.length,
      pendingApprovals: hackathons.filter(
        (h) => h.status === "pending_approval"
      ).length,
      publishedHackathons: hackathons.filter((h) => h.status === "published")
        .length,
      draftHackathons: hackathons.filter((h) => h.status === "draft").length,
      completedHackathons: hackathons.filter((h) => h.status === "completed")
        .length,
      totalParticipants,
      totalOrganizers,
      totalJudges,
      totalUsers,
      activeEvents: calculateActiveEvents(hackathons),
      totalTeams: allTeams.length,
      totalProjects: allProjects.length,
      averageParticipantsPerHackathon:
        hackathons.length > 0
          ? Math.round(totalParticipants / hackathons.length)
          : 0,
    };

    // Get recent activity (last 10 hackathons with status changes)
    const recentActivity = hackathons.slice(0, 10).map((hackathon) => ({
      _id: hackathon._id,
      title: hackathon.title,
      status: hackathon.status,
      theme: hackathon.theme,
      organizer: {
        name: hackathon.organizerId?.displayName || "Unknown",
        email: hackathon.organizerId?.email || "Unknown",
      },
      createdAt: hackathon.createdAt,
      updatedAt: hackathon.updatedAt,
    }));

    // Calculate platform insights
    const platformInsights = await calculatePlatformInsights(
      hackathons,
      allTeams,
      allProjects
    );

    // Get growth metrics
    const growthMetrics = calculateGrowthMetrics(hackathons);

    res.json({
      success: true,
      stats,
      recentActivity,
      platformInsights,
      growthMetrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

// Helper function to calculate active events
function calculateActiveEvents(hackathons) {
  const now = new Date();
  return hackathons.filter((hackathon) => {
    if (
      !hackathon.timelines?.hackathonStart ||
      !hackathon.timelines?.hackathonEnd
    ) {
      return false;
    }
    const start = new Date(hackathon.timelines.hackathonStart);
    const end = new Date(hackathon.timelines.hackathonEnd);
    return now >= start && now <= end && hackathon.status === "published";
  }).length;
}

// Calculate platform insights
async function calculatePlatformInsights(hackathons, teams, projects) {
  // Monthly growth calculation
  const now = new Date();
  const lastMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate()
  );
  const hackathonsThisMonth = hackathons.filter(
    (h) => new Date(h.createdAt) >= lastMonth
  ).length;
  const hackathonsLastMonth = hackathons.filter((h) => {
    const created = new Date(h.createdAt);
    const twoMonthsAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 2,
      now.getDate()
    );
    return created >= twoMonthsAgo && created < lastMonth;
  }).length;

  const monthlyGrowth =
    hackathonsLastMonth > 0
      ? (
          ((hackathonsThisMonth - hackathonsLastMonth) / hackathonsLastMonth) *
          100
        ).toFixed(1)
      : hackathonsThisMonth > 0
      ? 100
      : 0;

  // Popular themes
  const themeCount = {};
  hackathons.forEach((h) => {
    if (h.theme) {
      themeCount[h.theme] = (themeCount[h.theme] || 0) + 1;
    }
  });
  const popularThemes = Object.entries(themeCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([theme]) => theme);

  // Success rate (completed vs total published)
  const publishedHackathons = hackathons.filter(
    (h) => h.status === "published" || h.status === "completed"
  );
  const completedHackathons = hackathons.filter(
    (h) => h.status === "completed"
  );
  const successRate =
    publishedHackathons.length > 0
      ? (
          (completedHackathons.length / publishedHackathons.length) *
          100
        ).toFixed(1)
      : 0;

  // Average participants per hackathon
  const participantCounts = teams.reduce((acc, team) => {
    const hackathonId = team.hackathon?.toString();
    if (hackathonId) {
      acc[hackathonId] = (acc[hackathonId] || 0) + team.members.length;
    }
    return acc;
  }, {});

  const totalParticipantSlots = Object.values(participantCounts).reduce(
    (sum, count) => sum + count,
    0
  );
  const averageParticipants =
    hackathons.length > 0
      ? Math.round(totalParticipantSlots / hackathons.length)
      : 0;

  // Project submission rate
  const hackathonsWithProjects = [
    ...new Set(projects.map((p) => p.hackathon?.toString())),
  ].length;
  const submissionRate =
    hackathons.length > 0
      ? ((hackathonsWithProjects / hackathons.length) * 100).toFixed(1)
      : 0;

  return {
    monthlyGrowth: parseFloat(monthlyGrowth),
    popularThemes,
    successRate: parseFloat(successRate),
    averageParticipants,
    submissionRate: parseFloat(submissionRate),
    totalTeamsFormed: teams.length,
    totalProjectsSubmitted: projects.length,
  };
}

// Calculate growth metrics
function calculateGrowthMetrics(hackathons) {
  const now = new Date();
  const months = [];

  // Get last 6 months of data
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const monthHackathons = hackathons.filter((h) => {
      const created = new Date(h.createdAt);
      return created >= monthStart && created <= monthEnd;
    });

    months.push({
      month: monthStart.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      hackathons: monthHackathons.length,
      published: monthHackathons.filter((h) => h.status === "published").length,
      completed: monthHackathons.filter((h) => h.status === "completed").length,
    });
  }

  return { monthlyData: months };
}

// Get hackathons pending approval (existing function, keeping as is)
const getPendingHackathons = async (req, res) => {
  try {
    const pendingHackathons = await Hackathon.find({
      status: "pending_approval",
    })
      .populate("organizerId", "displayName email")
      .populate("judges", "displayName email")
      .sort({ createdAt: -1 });

    res.json(pendingHackathons);
  } catch (error) {
    console.error("Error fetching pending hackathons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending hackathons",
      error: error.message,
    });
  }
};

// Approve a hackathon (existing function, keeping as is)
const approveHackathon = async (req, res) => {
  try {
    const { id } = req.params;

    const hackathon = await Hackathon.findByIdAndUpdate(
      id,
      {
        status: "published",
        approvedAt: new Date(),
        approvedBy: req.user._id,
      },
      { new: true }
    ).populate("organizerId", "displayName email");

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    res.json({
      success: true,
      message: "Hackathon approved successfully",
      hackathon,
    });
  } catch (error) {
    console.error("Error approving hackathon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve hackathon",
      error: error.message,
    });
  }
};

// Reject a hackathon (existing function, keeping as is)
const rejectHackathon = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const hackathon = await Hackathon.findByIdAndUpdate(
      id,
      {
        status: "rejected",
        rejectedAt: new Date(),
        rejectedBy: req.user._id,
        rejectionReason: reason,
      },
      { new: true }
    ).populate("organizerId", "displayName email");

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    res.json({
      success: true,
      message: "Hackathon rejected successfully",
      hackathon,
    });
  } catch (error) {
    console.error("Error rejecting hackathon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject hackathon",
      error: error.message,
    });
  }
};

module.exports = {
  getAdminDashboard,
  getPendingHackathons,
  approveHackathon,
  rejectHackathon,
};
