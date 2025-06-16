const Hackathon = require("../models/Hackathon");
const User = require("../models/User");

// Get dashboard stats for admin
const getAdminDashboard = async (req, res) => {
  try {
    // Get all hackathons with proper population
    const hackathons = await Hackathon.find()
      .populate("organizerId", "displayName email") // Changed from 'organizer' to 'organizerId'
      .sort({ createdAt: -1 });

    // Calculate stats
    const stats = {
      totalHackathons: hackathons.length,
      pendingApprovals: hackathons.filter(
        (h) => h.status === "pending_approval"
      ).length,
      publishedHackathons: hackathons.filter((h) => h.status === "published")
        .length,
      draftHackathons: hackathons.filter((h) => h.status === "draft").length,
    };

    // Get recent activity (last 10 hackathons)
    const recentActivity = hackathons.slice(0, 10).map((hackathon) => ({
      _id: hackathon._id,
      title: hackathon.title,
      status: hackathon.status,
      organizer: {
        name: hackathon.organizerId?.displayName || "Unknown",
        email: hackathon.organizerId?.email || "Unknown",
      },
      createdAt: hackathon.createdAt,
    }));

    res.json({
      success: true,
      stats,
      recentActivity,
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

// Get hackathons pending approval
const getPendingHackathons = async (req, res) => {
  try {
    const pendingHackathons = await Hackathon.find({
      status: "pending_approval",
    })
      .populate("organizerId", "displayName email") // Changed from 'organizer' to 'organizerId'
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

// Approve a hackathon
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

// Reject a hackathon
const rejectHackathon = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const hackathon = await Hackathon.findByIdAndUpdate(
      id,
      {
        status: "draft",
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
