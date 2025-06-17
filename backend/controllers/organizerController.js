const Hackathon = require("../models/Hackathon");
const User = require("../models/User");
const Team = require("../models/Team");
const Project = require("../models/Project");

// Get organizer analytics
async function getOrganizerAnalytics(req, res) {
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

    // Get organizer's hackathons within date range
    const hackathons = await Hackathon.find({
      organizerId: userId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });

    const allHackathons = await Hackathon.find({ organizerId: userId });

    // Get teams for these hackathons
    const hackathonIds = hackathons.map(h => h._id);
    const teams = await Team.find({
      hackathon: { $in: hackathonIds }
    }).populate('members.user', 'displayName email');

    // Get projects for these hackathons
    const projects = await Project.find({
      hackathon: { $in: hackathonIds }
    }).populate('team', 'name').populate('builders.user', 'displayName');

    // Calculate overview stats
    const overview = {
      totalHackathons: allHackathons.length,
      totalParticipants: teams.reduce((sum, team) => sum + team.members.length, 0),
      totalTeams: teams.length,
      avgTeamSize: teams.length > 0 ? (teams.reduce((sum, team) => sum + team.members.length, 0) / teams.length).toFixed(1) : 0,
      completionRate: calculateCompletionRate(allHackathons),
      avgRating: calculateAverageRating(allHackathons)
    };

    // Generate monthly data
    const monthlyData = generateMonthlyData(hackathons, teams, timeRange);

    // Generate participant growth data
    const participantGrowth = generateParticipantGrowth(teams, timeRange);

    // Get hackathon status distribution
    const hackathonStatus = [
      { 
        name: "Completed", 
        value: allHackathons.filter(h => h.status === "completed").length,
        color: "#86efac"
      },
      { 
        name: "Ongoing", 
        value: allHackathons.filter(h => h.status === "ongoing" || h.status === "published").length,
        color: "#7dd3fc"
      },
      { 
        name: "Draft", 
        value: allHackathons.filter(h => h.status === "draft" || h.status === "pending_approval").length,
        color: "#fbbf24"
      }
    ];

    // Get team size distribution
    const teamSizeDistribution = generateTeamSizeDistribution(teams);

    // Get top performing hackathons
    const topPerformingHackathons = getTopPerformingHackathons(allHackathons, teams);

    // Calculate engagement metrics
    const engagementMetrics = calculateEngagementMetrics(allHackathons, teams, projects);

    const analyticsData = {
      overview,
      monthlyData,
      participantGrowth,
      hackathonStatus,
      teamSizeDistribution,
      topPerformingHackathons,
      engagementMetrics
    };

    res.status(200).json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch analytics data"
    });
  }
}

// Helper function to calculate completion rate
function calculateCompletionRate(hackathons) {
  if (hackathons.length === 0) return 0;
  const completed = hackathons.filter(h => h.status === "completed").length;
  return Math.round((completed / hackathons.length) * 100);
}

// Helper function to calculate average rating
function calculateAverageRating(hackathons) {
  if (hackathons.length === 0) return 0;
  // Mock rating calculation - you can implement actual rating system
  const ratings = hackathons.map(h => {
    // Generate rating based on hackathon properties
    let rating = 4.0;
    if (h.judges && h.judges.length > 2) rating += 0.3;
    if (h.bannerImageUrl) rating += 0.2;
    if (h.prizes && Object.keys(h.prizes).length > 0) rating += 0.3;
    return Math.min(rating, 5.0);
  });
  
  const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  return Math.round(avgRating * 10) / 10;
}

// Helper function to generate monthly data
function generateMonthlyData(hackathons, teams, timeRange) {
  const months = timeRange === "3months" ? 3 : timeRange === "6months" ? 6 : 12;
  const monthlyData = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthHackathons = hackathons.filter(h => 
      h.createdAt >= monthStart && h.createdAt <= monthEnd
    );
    
    const monthTeams = teams.filter(t =>
      t.createdAt >= monthStart && t.createdAt <= monthEnd
    );
    
    const monthParticipants = monthTeams.reduce((sum, team) => sum + team.members.length, 0);

    monthlyData.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
      hackathons: monthHackathons.length,
      participants: monthParticipants,
      teams: monthTeams.length
    });
  }

  return monthlyData;
}

// Helper function to generate participant growth
function generateParticipantGrowth(teams, timeRange) {
  const months = timeRange === "3months" ? 3 : timeRange === "6months" ? 6 : 12;
  const growthData = [];
  const now = new Date();
  let cumulativeParticipants = 0;

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthTeams = teams.filter(t =>
      t.createdAt >= monthStart && t.createdAt <= monthEnd
    );
    
    const monthParticipants = monthTeams.reduce((sum, team) => sum + team.members.length, 0);
    cumulativeParticipants += monthParticipants;
    
    // Calculate growth percentage
    const prevMonth = growthData[growthData.length - 1];
    const growth = prevMonth ? 
      Math.round(((cumulativeParticipants - prevMonth.participants) / (prevMonth.participants || 1)) * 100) : 0;

    growthData.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
      participants: cumulativeParticipants,
      growth: Math.max(growth, 0)
    });
  }

  return growthData;
}

// Helper function to generate team size distribution
function generateTeamSizeDistribution(teams) {
  const distribution = { "1": 0, "2-3": 0, "4-5": 0, "6+": 0 };
  
  // If no teams, return mock data for visualization
  if (teams.length === 0) {
    return [
      { size: "1", count: 0, color: "#fca5a5" },
      { size: "2-3", count: 0, color: "#fdba74" },
      { size: "4-5", count: 0, color: "#86efac" },
      { size: "6+", count: 0, color: "#7dd3fc" }
    ];
  }
  
  teams.forEach(team => {
    const size = team.members ? team.members.length : 0;
    if (size === 1) distribution["1"]++;
    else if (size >= 2 && size <= 3) distribution["2-3"]++;
    else if (size >= 4 && size <= 5) distribution["4-5"]++;
    else if (size > 5) distribution["6+"]++;
  });

  return [
    { size: "1", count: distribution["1"], color: "#fca5a5" },
    { size: "2-3", count: distribution["2-3"], color: "#fdba74" },
    { size: "4-5", count: distribution["4-5"], color: "#86efac" },
    { size: "6+", count: distribution["6+"], color: "#7dd3fc" }
  ];
}

// Helper function to get top performing hackathons
function getTopPerformingHackathons(hackathons, teams) {
  const hackathonPerformance = hackathons.map(hackathon => {
    const hackathonTeams = teams.filter(t => t.hackathon.toString() === hackathon._id.toString());
    const participants = hackathonTeams.reduce((sum, team) => sum + team.members.length, 0);
    
    // Calculate mock rating based on engagement
    let rating = 4.0;
    if (participants > 50) rating += 0.4;
    if (hackathonTeams.length > 10) rating += 0.3;
    if (hackathon.judges && hackathon.judges.length > 2) rating += 0.3;
    
    return {
      name: hackathon.title,
      participants,
      teams: hackathonTeams.length,
      rating: Math.min(Math.round(rating * 10) / 10, 5.0)
    };
  });

  return hackathonPerformance
    .sort((a, b) => b.participants - a.participants)
    .slice(0, 4);
}

// Helper function to calculate engagement metrics
function calculateEngagementMetrics(hackathons, teams, projects) {
  const totalHackathons = hackathons.length;
  if (totalHackathons === 0) return [];

  // Registration Rate: percentage of hackathons that got participants
  const hackathonsWithParticipants = hackathons.filter(h => {
    return teams.some(t => t.hackathon.toString() === h._id.toString());
  }).length;
  const registrationRate = Math.round((hackathonsWithParticipants / totalHackathons) * 100);

  // Completion Rate: percentage of teams that submitted projects
  const totalTeams = teams.length;
  const teamsWithProjects = projects.filter(p => p.status !== "draft").length;
  const completionRate = totalTeams > 0 ? Math.round((teamsWithProjects / totalTeams) * 100) : 0;

  // Team Formation Rate: percentage of registered participants who joined teams
  const teamFormationRate = Math.round(Math.random() * 15 + 85); // Mock data

  // Submission Rate: percentage of teams that submitted final projects
  const submissionRate = totalTeams > 0 ? Math.round((projects.filter(p => p.status === "submitted").length / totalTeams) * 100) : 0;

  return [
    { 
      metric: "Registration Rate", 
      value: registrationRate, 
      trend: Math.round(Math.random() * 20 - 5) // Random trend for demo
    },
    { 
      metric: "Completion Rate", 
      value: completionRate, 
      trend: Math.round(Math.random() * 10 - 5)
    },
    { 
      metric: "Team Formation", 
      value: teamFormationRate, 
      trend: Math.round(Math.random() * 15 + 5)
    },
    { 
      metric: "Submission Rate", 
      value: submissionRate, 
      trend: Math.round(Math.random() * 25 + 5)
    }
  ];
}

async function getOrganizerDashboard(req, res) {
  try {
    const userId = req.user._id;

    // Fetch hackathons organized by this user
    const hackathons = await Hackathon.find({ organizerId: userId }).sort({ createdAt: -1 });

    // Stats
    const totalHackathons = hackathons.length;
    const now = new Date();
    const activeEvents = hackathons.filter(h =>
      h.timelines &&
      h.timelines.hackathonStart &&
      h.timelines.hackathonEnd &&
      now >= new Date(h.timelines.hackathonStart) &&
      now <= new Date(h.timelines.hackathonEnd)
    ).length;

    // Get teams for participant count
    const hackathonIds = hackathons.map(h => h._id);
    const teams = await Team.find({
      hackathon: { $in: hackathonIds }
    }).populate('members.user', 'displayName email');

    const totalParticipants = teams.reduce((sum, team) => sum + team.members.length, 0);

    // Success rate: completed hackathons / total
    const completed = hackathons.filter(h => h.status === "completed").length;
    const successRate = totalHackathons > 0 ? Math.round((completed / totalHackathons) * 100) : 0;

    // Recent Activity - based on hackathon creation/updates
    const recentActivity = hackathons.slice(0, 5).map(h => ({
      message: `Hackathon "${h.title}" was ${h.status === 'draft' ? 'created' : 'updated'}`,
      timestamp: h.updatedAt
    }));

    // Upcoming Events - hackathons starting soon
    const upcomingEvents = hackathons.filter(h => {
      if (!h.timelines?.hackathonStart) return false;
      const startDate = new Date(h.timelines.hackathonStart);
      return startDate > now;
    }).slice(0, 3).map(h => ({
      title: h.title,
      startDate: h.timelines.hackathonStart,
      endDate: h.timelines.hackathonEnd
    }));

    // To-Do List: missing banner or no judges
    const todoList = [];
    hackathons.forEach(h => {
      if (!h.bannerImageUrl) todoList.push({ task: `Add banner to "${h.title}"` });
      if (!h.judges || h.judges.length === 0) todoList.push({ task: `Invite judges for "${h.title}"` });
    });

    // Insights: participant count per hackathon
    const insights = hackathons.map(h => {
      const hackathonTeams = teams.filter(t => t.hackathon.toString() === h._id.toString());
      const participants = hackathonTeams.reduce((sum, team) => sum + team.members.length, 0);
      return {
        title: h.title,
        participants,
        maxTeamSize: h.teamSettings?.maxTeamSize || 0,
        minTeamSize: h.teamSettings?.minTeamSize || 0,
      };
    });

    // Leaderboard: top participants by submissions/activity
    const participantStats = {};
    teams.forEach(team => {
      team.members.forEach(member => {
        const userId = member.user._id.toString();
        if (!participantStats[userId]) {
          participantStats[userId] = {
            _id: userId,
            displayName: member.user.displayName,
            email: member.user.email,
            photoURL: member.user.photoURL,
            submissions: 0
          };
        }
        participantStats[userId].submissions++;
      });
    });

    const leaderboard = Object.values(participantStats)
      .sort((a, b) => b.submissions - a.submissions)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalHackathons,
          activeEvents,
          totalParticipants,
          successRate,
        },
        hackathons,
        recentActivity,
        upcomingEvents,
        todoList,
        insights,
        leaderboard,
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

module.exports = {
  getOrganizerDashboard,
  getOrganizerAnalytics,
};