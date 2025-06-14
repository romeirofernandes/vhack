const User = require("../models/User");
const Hackathon = require("../models/Hackathon");

const userController = {
  // Get all judges
  async getAllJudges(req, res) {
    try {
      console.log('Fetching all judges...');
      const judges = await User.find({ role: 'judge' })
        .select('-password')
        .lean();

      console.log(`Found ${judges.length} judges`);
      
      res.status(200).json({
        success: true,
        judges: judges,
        count: judges.length
      });
    } catch (error) {
      console.error('Error fetching judges:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching judges',
        details: error.message
      });
    }
  },

  // Search users by email and role
  async searchUsers(req, res) {
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
        email: { $regex: email, $options: 'i' }, // Case-insensitive search
      };

      // Add role filter if specified
      if (role) {
        query.role = role;
      }

      const users = await User.find(query)
        .select('_id email displayName role profile')
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
  },

  // Send judge invite
  async sendJudgeInvite(req, res) {
    try {
      const { hackathonId } = req.params;
      const { judgeId } = req.body;

      // Check if hackathon exists
      const hackathon = await Hackathon.findById(hackathonId);
      if (!hackathon) {
        return res.status(404).json({
          success: false,
          error: "Hackathon not found",
        });
      }

      // Check if judge exists and is actually a judge
      const judge = await User.findOne({ _id: judgeId, role: 'judge' });
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
  },
};

module.exports = userController; 