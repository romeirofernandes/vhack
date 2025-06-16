const Team = require("../models/Team");
const Hackathon = require("../models/Hackathon");
const User = require("../models/User");
const crypto = require("crypto");

// Create a team
exports.createTeam = async (req, res) => {
  try {
    const { name, description, hackathonId } = req.body;
    const userId = req.user._id;

    // Check if hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) return res.status(404).json({ success: false, error: "Hackathon not found" });

    // Check if user already has a team in this hackathon
    const existing = await Team.findOne({ hackathon: hackathonId, "members.user": userId });
    if (existing) return res.status(400).json({ success: false, error: "Already in a team for this hackathon" });

    // Create team
    let joinCode;
    let codeExists = true;
    while (codeExists) {
      joinCode = crypto.randomBytes(3).toString("hex").toUpperCase(); // e.g. 'A1B2C3'
      codeExists = await Team.findOne({ joinCode });
    }

    const team = new Team({
      name,
      description,
      hackathon: hackathonId,
      leader: userId,
      members: [{ user: userId, role: "leader", joinedAt: new Date() }],
      joinCode, // <-- Save code
    });
    await team.save();

    res.status(201).json({ success: true, data: team });
  } catch (err) {
    console.error("Error creating team:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.joinTeam = async (req, res) => {
  try {
    console.log("Joining team with code:", req.body);
    const { code } = req.body;
    const userId = req.user._id;

    const team = await Team.findOne({ joinCode: code });
    if (!team) return res.status(404).json({ success: false, error: "Invalid code" });

    // Check if already a member
    if (team.members.some(m => m.user.toString() === userId.toString()))
      return res.status(400).json({ success: false, error: "Already a member" });

    // Check team size
    const hackathon = await Hackathon.findById(team.hackathon);
    if (team.members.length >= (hackathon.teamSettings?.maxTeamSize || 4))
      return res.status(400).json({ success: false, error: "Team is full" });

    team.members.push({ user: userId, role: "member", joinedAt: new Date() });
    await team.save();

    res.json({ success: true, data: team });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get teams for a hackathon
exports.getTeamsForHackathon = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const teams = await Team.find({ hackathon: hackathonId }).populate("members.user", "displayName email");
    res.json({ success: true, data: teams });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMyTeamForHackathon = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const userId = req.user._id;
    const team = await Team.findOne({
      hackathon: hackathonId,
      "members.user": userId,
    }).populate("members.user", "displayName email");
    if (!team) return res.json({ success: false, data: null });
    res.json({ success: true, data: team });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMyTeams = async (req, res) => {
  try {
    const userId = req.user._id;
    const teams = await Team.find({ "members.user": userId })
      .populate("hackathon")
      .populate("members.user", "displayName email");
    res.json({ success: true, data: teams });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};