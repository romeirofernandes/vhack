const Hackathon = require("../models/Hackathon");
const User = require("../models/User");

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
      now >= h.timelines.hackathonStart &&
      now <= h.timelines.hackathonEnd
    ).length;

    // For demo: participants = maxTeamSize * hackathons (since no participants array)
    const totalParticipants = hackathons.reduce(
      (sum, h) => sum + (h.teamSettings?.maxTeamSize || 0),
      0
    );

    // Success rate: completed hackathons / total
    const completed = hackathons.filter(h => h.status === "completed").length;
    const successRate = totalHackathons > 0 ? Math.round((completed / totalHackathons) * 100) : 0;

    // Recent Activity: show last 5 created hackathons
    const recentActivity = hackathons.slice(0, 5).map(h => ({
      type: "hackathon",
      message: `Hackathon "${h.title}" created`,
      timestamp: h.createdAt,
    }));

    // Upcoming Events: hackathons with start date in future
    const upcomingEvents = hackathons
      .filter(h => h.timelines?.hackathonStart && h.timelines.hackathonStart > now)
      .sort((a, b) => a.timelines.hackathonStart - b.timelines.hackathonStart)
      .slice(0, 3)
      .map(h => ({
        title: h.title,
        startDate: h.timelines.hackathonStart,
        endDate: h.timelines.hackathonEnd,
      }));

    // To-Do List: missing banner or no judges
    const todoList = [];
    hackathons.forEach(h => {
      if (!h.bannerImageUrl) todoList.push({ task: `Add banner to "${h.title}"` });
      if (!h.judges || h.judges.length === 0) todoList.push({ task: `Invite judges for "${h.title}"` });
    });

    // Insights: show team size per hackathon
    const insights = hackathons.map(h => ({
      title: h.title,
      maxTeamSize: h.teamSettings?.maxTeamSize || 0,
      minTeamSize: h.teamSettings?.minTeamSize || 0,
    }));

    // Leaderboard: not possible without participants, so show top hackathons by team size
    const leaderboard = hackathons
      .sort((a, b) => (b.teamSettings?.maxTeamSize || 0) - (a.teamSettings?.maxTeamSize || 0))
      .slice(0, 3)
      .map(h => ({
        title: h.title,
        maxTeamSize: h.teamSettings?.maxTeamSize || 0,
      }));

    res.json({
      success: true,
      data: {
        stats: {
          totalHackathons,
          activeEvents,
          totalParticipants,
          successRate,
        },
        recentActivity,
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