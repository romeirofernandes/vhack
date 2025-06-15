const Hackathon = require("../models/Hackathon");
const User = require("../models/User");


async function getOrganizerDashboard(req, res) {
    console.log("Fetching organizer dashboard data...");
  try {
    console.log("Request user:", req.user);
    const userId = req.user._id;
    console.log("User ID:", userId);

    // Fetch hackathons organized by this user
    const hackathons = await Hackathon.find({ organizer: userId })
      .populate("participants")
      .populate("projects");

    // Recent Activity (last 5 actions)
    const recentActivity = [];
    hackathons.forEach(h => {
      if (h.projects && h.projects.length > 0) {
        h.projects.slice(-2).forEach(p => {
          recentActivity.push({
            type: "submission",
            message: `Project "${p.title}" submitted to ${h.title}`,
            timestamp: p.createdAt,
          });
        });
      }
      if (h.participants && h.participants.length > 0) {
        recentActivity.push({
          type: "participant",
          message: `${h.participants[h.participants.length-1].displayName} joined ${h.title}`,
          timestamp: h.participants[h.participants.length-1].createdAt,
        });
      }
    });
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Upcoming Events (next 3)
    const now = new Date();
    const upcomingEvents = hackathons
      .filter(h => new Date(h.startDate) > now)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 3)
      .map(h => ({
        title: h.title,
        startDate: h.startDate,
        endDate: h.endDate,
      }));

    // To-Do List (example: pending approvals, incomplete setup)
    const todoList = [];
    hackathons.forEach(h => {
      if (!h.bannerImageUrl) todoList.push({ task: `Add banner to ${h.title}` });
      if (!h.judges || h.judges.length === 0) todoList.push({ task: `Invite judges for ${h.title}` });
    });

    // Insights/Charts (example: participant count per event)
    const insights = hackathons.map(h => ({
      title: h.title,
      participants: h.participants.length,
      submissions: h.projects.length,
    }));

    // Leaderboard (top 3 participants by submissions)
    const participantMap = {};
    hackathons.forEach(h => {
      h.participants.forEach(p => {
        participantMap[p._id] = participantMap[p._id] || { ...p._doc, submissions: 0 };
      });
      h.projects.forEach(pr => {
        pr.builders.forEach(b => {
          if (participantMap[b.user]) participantMap[b.user].submissions += 1;
        });
      });
    });
    const leaderboard = Object.values(participantMap)
      .sort((a, b) => b.submissions - a.submissions)
      .slice(0, 3);

    res.json({
      success: true,
      data: {
        stats: {
          totalHackathons: hackathons.length,
          activeEvents: hackathons.filter(h => h.status === "ongoing").length,
          totalParticipants: hackathons.reduce((acc, h) => acc + h.participants.length, 0),
          successRate: 100, // Placeholder
        },
        recentActivity: recentActivity.slice(0, 5),
        upcomingEvents,
        todoList,
        insights,
        leaderboard,
      },
    });
  } catch (err) {
    console.error("Error fetching organizer dashboard data:", err);
    res.status(500).json({ success: false, message: "Failed to load dashboard", error: err.message });
  }
}

module.exports = {
  getOrganizerDashboard,
};