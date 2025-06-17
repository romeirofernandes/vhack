const User = require("../models/User");
const Hackathon = require("../models/Hackathon");
const Team = require("../models/Team");
const Project = require("../models/Project");
const mongoose = require("mongoose");

// Get all judges
async function getAllJudges(req, res) {
  try {
    console.log("Fetching all judges...");
    const judges = await User.find({ role: "judge" })
      .select("-password")
      .lean();

    console.log(`Found ${judges.length} judges`);

    res.status(200).json({
      success: true,
      judges: judges,
      count: judges.length,
    });
  } catch (error) {
    console.error("Error fetching judges:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching judges",
      details: error.message,
    });
  }
}

// Search users by email and role
async function searchUsers(req, res) {
  try {
    const { email, role } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required for search",
      });
    }

    // Build search query
    const query = {
      email: { $regex: email, $options: "i" }, // Case-insensitive search
    };

    // Add role filter if specified
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select("_id email displayName role profile")
      .limit(10);

    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No users found",
        users: [],
      });
    }

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search users",
    });
  }
}

// Send judge invite
async function sendJudgeInvite(req, res) {
  console.log("Sending judge invite...");
  try {
    const { hackathonId } = req.params;
    const { judgeId } = req.body;

    console.log(`Inviting judge ${judgeId} to hackathon ${hackathonId}`);
    if (!hackathonId || !judgeId) {
      return res.status(400).json({
        success: false,
        error: "Hackathon ID and Judge ID are required",
      });
    }

    // Check if hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        error: "Hackathon not found",
      });
    }

    // Check if judge exists and is actually a judge
    const judge = await User.findOne({ _id: judgeId, role: "judge" });
    if (!judge) {
      return res.status(404).json({
        success: false,
        error: "Judge not found",
      });
    }

    // Check if judge is already invited
    if (hackathon.invitedJudges?.includes(judgeId)) {
      return res.status(400).json({
        success: false,
        error: "Judge already invited",
      });
    }

    // Add judge to invited judges
    hackathon.invitedJudges = hackathon.invitedJudges || [];
    hackathon.invitedJudges.push(judgeId);
    await hackathon.save();

    res.status(200).json({
      success: true,
      message: "Judge invited successfully",
    });
  } catch (error) {
    console.error("Send judge invite error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send judge invite",
    });
  }
}

// Get pending hackathon invitations for a judge
async function getJudgeInvitations(req, res) {
  try {
    const userId = req.user._id;

    // Get all hackathons where this user is in invitedJudges array but not in judges array
    const hackathons = await Hackathon.find({
      invitedJudges: userId,
      judges: { $ne: userId },
    }).select("title organizerName theme timelines");

    const invitations = hackathons.map((hackathon) => ({
      _id: new mongoose.Types.ObjectId(),
      hackathon,
      invitedAt: hackathon._id.getTimestamp(), // Use document creation time as a fallback
    }));

    res.status(200).json({
      success: true,
      invitations,
    });
  } catch (error) {
    console.error("Error fetching judge invitations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch invitations",
    });
  }
}

// Respond to a hackathon invitation (accept or decline)
async function respondToInvitation(req, res) {
  try {
    const { hackathonId } = req.params;
    const { accept } = req.body;
    const userId = req.user._id;

    // Find the hackathon
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        error: "Hackathon not found",
      });
    }

    // Check if the user is actually invited
    if (!hackathon.invitedJudges.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: "You are not invited to this hackathon",
      });
    }

    if (accept) {
      // Add to judges array if not already there
      if (!hackathon.judges.includes(userId)) {
        hackathon.judges.push(userId);
      }
    }

    // Remove from invitedJudges array either way
    hackathon.invitedJudges = hackathon.invitedJudges.filter(
      (id) => id.toString() !== userId.toString()
    );

    await hackathon.save(); // This will trigger the pre-save middleware

    // Check if hackathon is now ready for approval
    await hackathon.checkForApproval();

    res.status(200).json({
      success: true,
      message: accept ? "Invitation accepted" : "Invitation declined",
      hackathonStatus: hackathon.status, // Return the updated status
    });
  } catch (error) {
    console.error("Error responding to invitation:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process your response",
    });
  }
}

// Get judge dashboard data
async function getJudgeDashboard(req, res) {
  try {
    const userId = req.user._id;

    // Get judge's hackathons (where user is invited as judge)
    const judgeHackathons = await Hackathon.find({
      judges: userId
    }).populate('organizerId', 'displayName email');

    // Get pending invitations
    const pendingInvitations = await Hackathon.find({
      invitedJudges: userId,
      judges: { $ne: userId }
    }).populate('organizerId', 'displayName email');

    // Get projects to judge
    const projectsToJudge = await Project.find({
      hackathon: { $in: judgeHackathons.map(h => h._id) },
      status: { $in: ['submitted', 'judging'] },
      'scores.judge': { $ne: userId }
    }).populate('hackathon', 'title')
      .populate('team', 'name')
      .populate('builders.user', 'displayName');

    // Get judged projects
    const judgedProjects = await Project.find({
      'scores.judge': userId
    }).populate('hackathon', 'title')
      .populate('team', 'name');

    // Calculate stats
    const stats = {
      totalHackathons: judgeHackathons.length,
      pendingInvitations: pendingInvitations.length,
      projectsToJudge: projectsToJudge.length,
      projectsJudged: judgedProjects.length,
      averageScore: calculateAverageScore(judgedProjects, userId),
      completionRate: calculateCompletionRate(judgeHackathons, judgedProjects)
    };

    // Get recent activity
    const recentActivity = getRecentJudgeActivity(judgedProjects, judgeHackathons);

    // Get upcoming deadlines
    const upcomingDeadlines = getUpcomingJudgeDeadlines(judgeHackathons);

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentActivity,
        upcomingDeadlines,
        pendingInvitations: pendingInvitations.slice(0, 5),
        projectsToJudge: projectsToJudge.slice(0, 5),
        judgedProjects: judgedProjects.slice(0, 5)
      }
    });

  } catch (error) {
    console.error("Judge Dashboard error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard data"
    });
  }
}

// Get judge analytics
async function getJudgeAnalytics(req, res) {
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

    // Get judge's hackathons
    const judgeHackathons = await Hackathon.find({
      judges: userId,
      createdAt: { $gte: startDate }
    }).populate('organizerId', 'displayName email');

    // Get all judge's hackathons (for total stats)
    const allJudgeHackathons = await Hackathon.find({
      judges: userId
    }).populate('organizerId', 'displayName email');

    // Get projects judged by this judge
    const judgedProjects = await Project.find({
      "scores.judge": userId,
      createdAt: { $gte: startDate }
    }).populate('hackathon', 'title')
      .populate('team', 'name')
      .populate('scores.judge', 'displayName');

    // Get all judged projects
    const allJudgedProjects = await Project.find({
      "scores.judge": userId
    }).populate('hackathon', 'title')
      .populate('team', 'name')
      .populate('scores.judge', 'displayName');

    // Get pending projects
    const pendingProjects = await Project.find({
      hackathon: { $in: allJudgeHackathons.map(h => h._id) },
      status: { $in: ["submitted", "judging"] },
      "scores.judge": { $ne: userId }
    }).populate('hackathon', 'title')
      .populate('team', 'name');

    // Calculate overview stats
    const overview = {
      totalHackathons: allJudgeHackathons.length,
      projectsJudged: allJudgedProjects.length,
      pendingReviews: pendingProjects.length,
      averageScore: calculateAverageScore(allJudgedProjects, userId),
      completionRate: calculateJudgeCompletionRate(allJudgeHackathons, allJudgedProjects),
      expertise: await getJudgeExpertise(userId)
    };

    // Generate monthly data
    const monthlyData = generateJudgeMonthlyData(judgedProjects, judgeHackathons, timeRange);

    // Generate scoring trends
    const scoringTrends = generateScoringTrends(allJudgedProjects, userId, timeRange);

    // Get judging category distribution
    const categoryDistribution = generateCategoryDistribution(allJudgedProjects, userId);

    // Get scoring distribution
    const scoringDistribution = generateScoringDistribution(allJudgedProjects, userId);

    // Get top rated projects
    const topRatedProjects = getTopRatedProjects(allJudgedProjects, userId);

    // Calculate performance metrics
    const performanceMetrics = calculateJudgePerformance(allJudgeHackathons, allJudgedProjects, pendingProjects);

    const analyticsData = {
      overview,
      monthlyData,
      scoringTrends,
      categoryDistribution,
      scoringDistribution,
      topRatedProjects,
      performanceMetrics
    };

    res.status(200).json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error("Judge Analytics error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch analytics data"
    });
  }
}

// Helper functions
function calculateAverageScore(projects, judgeId) {
  if (projects.length === 0) return 0;
  
  let totalScore = 0;
  let scoreCount = 0;
  
  projects.forEach(project => {
    const judgeScore = project.scores?.find(score => 
      score.judge.toString() === judgeId.toString()
    );
    if (judgeScore) {
      totalScore += judgeScore.totalScore || 0;
      scoreCount++;
    }
  });
  
  return scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : 0;
}

function calculateCompletionRate(hackathons, judgedProjects) {
  if (hackathons.length === 0) return 0;
  const estimatedProjects = hackathons.length * 5; // Assume 5 projects per hackathon
  return Math.min(100, Math.round((judgedProjects.length / estimatedProjects) * 100));
}

function calculateJudgeCompletionRate(hackathons, judgedProjects) {
  if (hackathons.length === 0) return 0;
  const estimatedProjects = hackathons.length * 5;
  const actualJudged = judgedProjects.length;
  return Math.min(100, Math.round((actualJudged / estimatedProjects) * 100));
}

async function getJudgeExpertise(judgeId) {
  try {
    const judge = await User.findById(judgeId).select('profile.expertise');
    return judge?.profile?.expertise?.length || 0;
  } catch (error) {
    return 0;
  }
}

function getRecentJudgeActivity(judgedProjects, hackathons) {
  const activities = [];
  
  // Add recent judgments
  judgedProjects.slice(0, 3).forEach(project => {
    activities.push({
      type: "judgment",
      message: `Judged project "${project.title}" in ${project.hackathon?.title || 'Unknown Hackathon'}`,
      timestamp: project.updatedAt || project.createdAt,
      project: project.title
    });
  });

  // Add recent hackathon assignments
  hackathons.slice(0, 2).forEach(hackathon => {
    activities.push({
      type: "assignment",
      message: `Assigned as judge for "${hackathon.title}"`,
      timestamp: hackathon.createdAt,
      hackathon: hackathon.title
    });
  });

  return activities
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);
}

function getUpcomingJudgeDeadlines(hackathons) {
  const deadlines = [];
  const now = new Date();

  hackathons.forEach(hackathon => {
    if (hackathon.timelines?.hackathonEnd && new Date(hackathon.timelines.hackathonEnd) > now) {
      deadlines.push({
        hackathon: hackathon.title,
        type: "judging",
        deadline: hackathon.timelines.hackathonEnd,
        daysLeft: Math.ceil((new Date(hackathon.timelines.hackathonEnd) - now) / (1000 * 60 * 60 * 24))
      });
    }
  });

  return deadlines
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);
}

function generateJudgeMonthlyData(projects, hackathons, timeRange) {
  const months = timeRange === "3months" ? 3 : timeRange === "6months" ? 6 : 12;
  const monthlyData = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthProjects = projects.filter(p => 
      p.createdAt >= monthStart && p.createdAt <= monthEnd
    );
    
    const monthHackathons = hackathons.filter(h =>
      h.createdAt >= monthStart && h.createdAt <= monthEnd
    );

    monthlyData.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
      projectsJudged: monthProjects.length,
      hackathons: monthHackathons.length,
      averageScore: calculateMonthAverageScore(monthProjects)
    });
  }

  return monthlyData;
}

function calculateMonthAverageScore(projects) {
  if (projects.length === 0) return 0;
  
  let totalScore = 0;
  projects.forEach(project => {
    if (project.scores && project.scores.length > 0) {
      totalScore += project.scores[0].totalScore || 0;
    }
  });
  
  return projects.length > 0 ? Math.round(totalScore / projects.length) : 0;
}

function generateScoringTrends(projects, judgeId, timeRange) {
  const months = timeRange === "3months" ? 3 : timeRange === "6months" ? 6 : 12;
  const scoringTrends = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthProjects = projects.filter(p => 
      p.createdAt >= monthStart && p.createdAt <= monthEnd
    );
    
    let avgInnovation = 0, avgTechnical = 0, avgUX = 0, avgImpact = 0;
    
    if (monthProjects.length > 0) {
      monthProjects.forEach(project => {
        const judgeScore = project.scores?.find(score => 
          score.judge.toString() === judgeId.toString()
        );
        if (judgeScore?.criteria) {
          judgeScore.criteria.forEach(criterion => {
            switch (criterion.name.toLowerCase()) {
              case 'innovation':
                avgInnovation += criterion.score;
                break;
              case 'technical implementation':
                avgTechnical += criterion.score;
                break;
              case 'user experience':
                avgUX += criterion.score;
                break;
              case 'business impact':
                avgImpact += criterion.score;
                break;
            }
          });
        }
      });
      
      const projectCount = monthProjects.length;
      avgInnovation = Math.round(avgInnovation / projectCount);
      avgTechnical = Math.round(avgTechnical / projectCount);
      avgUX = Math.round(avgUX / projectCount);
      avgImpact = Math.round(avgImpact / projectCount);
    }

    scoringTrends.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
      innovation: avgInnovation,
      technical: avgTechnical,
      userExperience: avgUX,
      businessImpact: avgImpact
    });
  }

  return scoringTrends;
}

function generateCategoryDistribution(projects, judgeId) {
  const categories = {};
  
  projects.forEach(project => {
    if (project.hackathon?.theme) {
      const theme = project.hackathon.theme;
      if (!categories[theme]) {
        categories[theme] = 0;
      }
      categories[theme]++;
    }
  });

  return Object.entries(categories).map(([theme, count]) => ({
    category: theme,
    count,
    color: getCategoryColor(theme)
  }));
}

function getCategoryColor(category) {
  const colors = {
    'AI/ML': '#7dd3fc',
    'Web Development': '#86efac',
    'Mobile Apps': '#fbbf24',
    'IoT': '#f9a8d4',
    'Blockchain': '#a78bfa',
    'Sustainability': '#86efac',
    'Healthcare': '#fca5a5',
    'Education': '#fdba74',
    'Fintech': '#fbbf24',
    'Gaming': '#c084fc'
  };
  return colors[category] || '#71717a';
}

function generateScoringDistribution(projects, judgeId) {
  const distribution = {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '81-100': 0
  };

  projects.forEach(project => {
    const judgeScore = project.scores?.find(score => 
      score.judge.toString() === judgeId.toString()
    );
    
    if (judgeScore) {
      const score = judgeScore.totalScore || 0;
      if (score <= 20) distribution['0-20']++;
      else if (score <= 40) distribution['21-40']++;
      else if (score <= 60) distribution['41-60']++;
      else if (score <= 80) distribution['61-80']++;
      else distribution['81-100']++;
    }
  });

  return [
    { range: '0-20', count: distribution['0-20'], color: '#fca5a5' },
    { range: '21-40', count: distribution['21-40'], color: '#fdba74' },
    { range: '41-60', count: distribution['41-60'], color: '#fbbf24' },
    { range: '61-80', count: distribution['61-80'], color: '#86efac' },
    { range: '81-100', count: distribution['81-100'], color: '#7dd3fc' }
  ];
}

function getTopRatedProjects(projects, judgeId) {
  return projects
    .map(project => {
      const judgeScore = project.scores?.find(score => 
        score.judge.toString() === judgeId.toString()
      );
      return {
        projectName: project.title,
        hackathonName: project.hackathon?.title || 'Unknown',
        teamName: project.team?.name || 'Unknown',
        score: judgeScore?.totalScore || 0,
        feedback: judgeScore?.feedback || ''
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function calculateJudgePerformance(hackathons, projects, pendingProjects) {
  const totalAssigned = hackathons.length * 5; // Estimate
  const completed = projects.length;
  const pending = pendingProjects.length;
  
  const completionRate = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;
  const responseTime = Math.round(Math.random() * 48 + 12); // Mock response time in hours
  const consistency = Math.round(Math.random() * 20 + 80); // Mock consistency score
  const thoroughness = Math.round(Math.random() * 25 + 75); // Mock thoroughness score

  return [
    {
      metric: "Completion Rate",
      value: Math.min(100, completionRate),
      trend: Math.round(Math.random() * 15 + 5)
    },
    {
      metric: "Avg Response Time",
      value: responseTime,
      trend: Math.round(Math.random() * 10 - 5),
      suffix: "hrs"
    },
    {
      metric: "Scoring Consistency",
      value: consistency,
      trend: Math.round(Math.random() * 8 + 2)
    },
    {
      metric: "Review Thoroughness",
      value: thoroughness,
      trend: Math.round(Math.random() * 12 + 3)
    }
  ];
}

module.exports = {
  getAllJudges,
  searchUsers,
  sendJudgeInvite,
  getJudgeInvitations,
  respondToInvitation,
  getJudgeDashboard,
  getJudgeAnalytics
};