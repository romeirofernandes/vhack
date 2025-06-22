const Project = require("../models/Project");
const Hackathon = require("../models/Hackathon");

// Get results for a hackathon
const getHackathonResults = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res
        .status(404)
        .json({ success: false, error: "Hackathon not found" });
    }

    // Check if results should be visible
    const now = new Date();
    const resultsDate = new Date(hackathon.timelines.resultsDate);
    const isResultsTime = now >= resultsDate;
    const isResultsPublished = hackathon.resultsPublished || false;

    if (!isResultsTime && !isResultsPublished) {
      return res.status(403).json({
        success: false,
        error: "Results not yet available",
        resultsDate: resultsDate,
      });
    }

    // Get all projects with scores, sorted by finalScore
    const projects = await Project.find({
      hackathon: hackathonId,
      status: { $in: ["judged", "completed"] },
      finalScore: { $exists: true, $ne: null },
    })
      .populate("team", "name")
      .populate("builders.user", "displayName photoURL")
      .sort({ finalScore: -1, createdAt: 1 }); // Highest score first, then by submission time

    // Calculate rankings
    let currentRank = 1;
    let previousScore = null;
    let sameScoreCount = 0;

    const rankedResults = projects.map((project, index) => {
      if (previousScore !== null && project.finalScore < previousScore) {
        currentRank += sameScoreCount;
        sameScoreCount = 1;
      } else if (
        previousScore !== null &&
        project.finalScore === previousScore
      ) {
        sameScoreCount++;
      } else {
        sameScoreCount = 1;
      }

      previousScore = project.finalScore;

      return {
        _id: project._id,
        title: project.title,
        description: project.description,
        team: project.team,
        builders: project.builders.map((builder) => ({
          displayName: builder.user?.displayName,
          photoURL: builder.user?.photoURL,
        })),
        finalScore: project.finalScore,
        rank: currentRank,
        technologies: project.technologies,
        links: project.links,
      };
    });

    res.json({
      success: true,
      results: rankedResults,
      hackathon: {
        _id: hackathon._id,
        title: hackathon.title,
        theme: hackathon.theme,
        prizes: hackathon.prizes,
        resultsDate: hackathon.timelines.resultsDate,
        resultsPublished: hackathon.resultsPublished,
        resultsPublishedAt: hackathon.resultsPublishedAt,
      },
      isResultsTime,
      totalProjects: rankedResults.length,
    });
  } catch (error) {
    console.error("Error fetching hackathon results:", error);
    res.status(500).json({ success: false, error: "Failed to fetch results" });
  }
};

// Publish results early (organizer only)
const publishResults = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const userId = req.user._id;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res
        .status(404)
        .json({ success: false, error: "Hackathon not found" });
    }

    // Check if user is the organizer
    if (hackathon.organizerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: "Only the organizer can publish results",
      });
    }

    // Check if there are any judged projects
    const judgedProjects = await Project.find({
      hackathon: hackathonId,
      finalScore: { $exists: true, $ne: null },
    });

    if (judgedProjects.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No projects have been judged yet",
      });
    }

    // Update hackathon to mark results as published
    hackathon.resultsPublished = true;
    hackathon.resultsPublishedAt = new Date();
    await hackathon.save();

    res.json({
      success: true,
      message: "Results published successfully",
      publishedAt: hackathon.resultsPublishedAt,
      totalProjects: judgedProjects.length,
    });
  } catch (error) {
    console.error("Error publishing results:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to publish results" });
  }
};

module.exports = {
  getHackathonResults,
  publishResults,
};
