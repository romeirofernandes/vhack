const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const authMiddleware = require("../middleware/auth");


// All project routes require authentication
router.use(authMiddleware);

// Add these routes to your existing projectRoutes.js

// AI Analysis routes
router.post('/:projectId/ai-analyze', authMiddleware, projectController.analyzeProjectWithAI);

// Project CRUD operations
router.get("/", projectController.getProjects);
router.get("/:projectId", projectController.getProject);
router.post("/", projectController.createProject);
router.put("/:projectId", projectController.updateProject);
router.delete("/:projectId", projectController.deleteProject);

// Project submission
router.post("/:projectId/submit", projectController.submitProject);
router.post("/:projectId/unsubmit", projectController.unsubmitProject);

// Project media
router.post("/:projectId/images", projectController.addProjectImage);
router.delete(
  "/:projectId/images/:imageId",
  projectController.removeProjectImage
);

// Get submitted projects for judging
router.get("/hackathon/:hackathonId/submitted", authMiddleware, projectController.getSubmittedProjects);

// Submit judge score
// router.post("/:projectId/score", authMiddleware, projectController.submitJudgeScore);

module.exports = router;
