const User = require("../models/User");
const Hackathon = require("../models/Hackathon");
const Team = require("../models/Team");
const Project = require("../models/Project");

// Get participant dashboard data
async function getParticipantDashboard(req, res) {
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
}

// Get participant analytics
async function getParticipantAnalytics(req, res) {
  try {
    const userId = req.user._id;
    const { timeRange = "6months" } = req.query;

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case "3months":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "6months":
        startDate.setMonth(now.getMonth() - 6);
        break;
      case "1year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 6);
    }

    // Get user's teams within date range
    const teams = await Team.find({
      $or: [{ leader: userId }, { "members.user": userId }],
      createdAt: { $gte: startDate }
    }).populate('hackathon', 'title status startDate endDate createdAt')
      .populate('members.user', 'displayName email')
      .populate('project', 'title status submittedAt');

    // Get all user's teams (for total stats)
    const allTeams = await Team.find({
      $or: [{ leader: userId }, { "members.user": userId }]
    }).populate('hackathon', 'title status startDate endDate')
      .populate('project', 'title status submittedAt rank');

    // Get user's projects
    const projects = await Project.find({
      "builders.user": userId,
      createdAt: { $gte: startDate }
    }).populate('hackathon', 'title').populate('team', 'name');

    // Get all user's projects
    const allProjects = await Project.find({
      "builders.user": userId
    }).populate('hackathon', 'title').populate('team', 'name');

    // Get registered hackathons
    const hackathons = await Hackathon.find({
      _id: { $in: allTeams.map(t => t.hackathon._id) }
    });

    // Calculate overview stats
    const overview = {
      totalHackathons: hackathons.length,
      totalTeams: allTeams.length,
      totalProjects: allProjects.length,
      completedProjects: allProjects.filter(p => p.status === 'submitted' || p.status === 'judged').length,
      avgTeamSize: calculateAvgTeamSize(allTeams, userId),
      winRate: calculateWinRate(allProjects)
    };

    // Generate monthly data
    const monthlyData = generateParticipantMonthlyData(teams, projects, timeRange);

    // Generate progress over time
    const progressData = generateProgressData(allTeams, allProjects, timeRange);

    // Get hackathon participation status
    const participationStatus = [
      { 
        name: "Completed", 
        value: hackathons.filter(h => h.status === "completed").length,
        color: "#86efac"
      },
      { 
        name: "Ongoing", 
        value: hackathons.filter(h => h.status === "ongoing" || h.status === "published").length,
        color: "#7dd3fc"
      },
      { 
        name: "Upcoming", 
        value: hackathons.filter(h => new Date(h.startDate) > now).length,
        color: "#fbbf24"
      }
    ];

    // Get team role distribution
    const roleDistribution = generateRoleDistribution(allTeams, userId);

    // Get top performances
    const topPerformances = getTopPerformances(allProjects);

    // Calculate engagement metrics
    const engagementMetrics = calculateParticipantEngagement(allTeams, allProjects, hackathons);

    const analyticsData = {
      overview,
      monthlyData,
      progressData,
      participationStatus,
      roleDistribution,
      topPerformances,
      engagementMetrics
    };

    res.status(200).json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error("Participant Analytics error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch analytics data"
    });
  }
}

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

function calculateAvgTeamSize(teams, userId) {
  if (teams.length === 0) return 0;
  const totalMembers = teams.reduce((sum, team) => sum + team.members.length, 0);
  return (totalMembers / teams.length).toFixed(1);
}

function calculateWinRate(projects) {
  if (projects.length === 0) return 0;
  const wins = projects.filter(p => p.rank && p.rank <= 3).length;
  return Math.round((wins / projects.length) * 100);
}

function generateParticipantMonthlyData(teams, projects, timeRange) {
  const months = timeRange === "3months" ? 3 : timeRange === "6months" ? 6 : 12;
  const monthlyData = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthTeams = teams.filter(t => 
      t.createdAt >= monthStart && t.createdAt <= monthEnd
    );
    
    const monthProjects = projects.filter(p =>
      p.createdAt >= monthStart && p.createdAt <= monthEnd
    );

    monthlyData.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
      teams: monthTeams.length,
      projects: monthProjects.length,
      hackathons: new Set(monthTeams.map(t => t.hackathon._id.toString())).size
    });
  }

  return monthlyData;
}

function generateProgressData(teams, projects, timeRange) {
  const months = timeRange === "3months" ? 3 : timeRange === "6months" ? 6 : 12;
  const progressData = [];
  const now = new Date();
  let cumulativeTeams = 0;
  let cumulativeProjects = 0;

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthTeams = teams.filter(t =>
      t.createdAt >= monthStart && t.createdAt <= monthEnd
    );
    
    const monthProjects = projects.filter(p =>
      p.createdAt >= monthStart && p.createdAt <= monthEnd
    );
    
    cumulativeTeams += monthTeams.length;
    cumulativeProjects += monthProjects.length;

    progressData.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
      teams: cumulativeTeams,
      projects: cumulativeProjects
    });
  }

  return progressData;
}

function generateRoleDistribution(teams, userId) {
  let leaderCount = 0;
  let memberCount = 0;

  teams.forEach(team => {
    if (team.leader.toString() === userId.toString()) {
      leaderCount++;
    } else {
      memberCount++;
    }
  });

  return [
    { role: "Team Leader", count: leaderCount, color: "#fbbf24" },
    { role: "Team Member", count: memberCount, color: "#7dd3fc" }
  ];
}

function getTopPerformances(projects) {
  return projects
    .filter(p => p.rank && p.rank <= 3)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5)
    .map(p => ({
      projectName: p.title,
      hackathonName: p.hackathon.title,
      rank: p.rank,
      teamName: p.team.name
    }));
}

function calculateParticipantEngagement(teams, projects, hackathons) {
  const totalHackathons = hackathons.length;
  
  // Completion Rate: projects submitted vs teams joined
  const completionRate = teams.length > 0 ? 
    Math.round((projects.filter(p => p.status === 'submitted' || p.status === 'judged').length / teams.length) * 100) : 0;

  // Team Formation Rate: teams vs hackathons
  const teamFormationRate = totalHackathons > 0 ? 
    Math.round((teams.length / totalHackathons) * 100) : 0;

  // Leadership Rate: teams led vs total teams
  const leadershipRate = teams.length > 0 ?
    Math.round((teams.filter(t => t.leader.toString() === teams[0].leader.toString()).length / teams.length) * 100) : 0;

  // Project Success Rate: ranked projects vs total projects
  const successRate = projects.length > 0 ?
    Math.round((projects.filter(p => p.rank && p.rank <= 3).length / projects.length) * 100) : 0;

  return [
    { 
      metric: "Completion Rate", 
      value: completionRate, 
      trend: Math.round(Math.random() * 20 + 5)
    },
    { 
      metric: "Team Formation", 
      value: teamFormationRate, 
      trend: Math.round(Math.random() * 15 + 10)
    },
    { 
      metric: "Leadership Rate", 
      value: leadershipRate, 
      trend: Math.round(Math.random() * 10 + 5)
    },
    { 
      metric: "Success Rate", 
      value: successRate, 
      trend: Math.round(Math.random() * 25 + 15)
    }
  ];
}

module.exports = {
  getParticipantDashboard,
  getParticipantAnalytics
};