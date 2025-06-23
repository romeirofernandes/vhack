const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  getAdminDashboard,
  getPendingHackathons,
  approveHackathon,
  rejectHackathon,
} = require("../controllers/adminController");

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Admin role required." });
  }
  next();
};

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(requireAdmin);

// Admin dashboard - GET /api/admin/dashboard
router.get("/dashboard", getAdminDashboard);

// Get hackathons pending approval - GET /api/admin/pending-hackathons
router.get("/pending-hackathons", getPendingHackathons);

// Approve a hackathon - PUT /api/admin/hackathons/:id/approve
router.put("/hackathons/:id/approve", approveHackathon);

// Reject a hackathon - PUT /api/admin/hackathons/:id/reject
router.put("/hackathons/:id/reject", rejectHackathon);

module.exports = router;
