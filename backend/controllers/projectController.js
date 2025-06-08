const Project = require("../models/Project");
const User = require("../models/User");
const Hackathon = require("../models/Hackathon");
const Team = require("../models/Team");

const projectController = {
  // Get user's projects
  async getProjects(req, res) {
    try {
      const userId = req.user._id;
      const { status, hackathon, page = 1, limit = 10 } = req.query;

      let query = {
        $or: [{ "builders.user": userId }, { creator: userId }],
      };

      // Filter by status
      if (status && status !== "all") {
        query.status = status;
      }

      // Filter by hackathon
      if (hackathon && hackathon !== "all") {
        query.hackathon = hackathon;
      }

      const projects = await Project.find(query)
        .populate("hackathon", "title status startDate endDate")
        .populate("team", "name members")
        .populate("builders.user", "displayName photoURL")
        .populate("creator", "displayName photoURL")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Project.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          projects,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total,
            hasNext: page * limit < total,
            hasPrev: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Get projects error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch projects",
      });
    }
  },

  // Get single project
  async getProject(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user._id;

      const project = await Project.findById(projectId)
        .populate("hackathon", "title status startDate endDate")
        .populate("team", "name members")
        .populate(
          "builders.user",
          "displayName photoURL profile.github profile.linkedin"
        )
        .populate("creator", "displayName photoURL");

      if (!project) {
        return res.status(404).json({
          success: false,
          error: "Project not found",
        });
      }

      // Check if user has access to this project
      const isBuilder = project.builders?.some(
        (builder) => builder.user._id.toString() === userId.toString()
      );
      const isCreator = project.creator?._id.toString() === userId.toString();

      if (!isBuilder && !isCreator && !project.isPublic) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
        });
      }

      res.status(200).json({
        success: true,
        data: { project },
      });
    } catch (error) {
      console.error("Get project error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch project",
      });
    }
  },

  // Create new project
  async createProject(req, res) {
    try {
      const userId = req.user._id;
      const {
        title,
        description,
        thumbnailImage,
        problemStatement,
        challenges,
        technologies,
        links,
        hackathonId,
        teamId,
        isPublic = true,
      } = req.body;

      // Validate required fields
      if (!title || !description) {
        return res.status(400).json({
          success: false,
          error: "Title and description are required",
        });
      }

      // Verify hackathon exists if provided
      let hackathon = null;
      if (hackathonId) {
        hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) {
          return res.status(404).json({
            success: false,
            error: "Hackathon not found",
          });
        }
      }

      // Verify team exists and user is a member if provided
      let team = null;
      if (teamId) {
        team = await Team.findById(teamId);
        if (!team) {
          return res.status(404).json({
            success: false,
            error: "Team not found",
          });
        }

        const isMember =
          team.leader.toString() === userId.toString() ||
          team.members?.some(
            (member) => member.user.toString() === userId.toString()
          );

        if (!isMember) {
          return res.status(403).json({
            success: false,
            error: "You are not a member of this team",
          });
        }
      }

      // Create project
      const project = new Project({
        title,
        description,
        thumbnailImage:
          thumbnailImage ||
          "https://via.placeholder.com/400x300?text=Project+Thumbnail",
        problemStatement: problemStatement || "",
        challenges: challenges || "",
        technologies: technologies || [],
        links: links || {},
        hackathon: hackathonId,
        team: teamId,
        creator: userId,
        builders: [
          {
            user: userId,
            role: "creator",
          },
        ],
        isPublic,
        status: "draft",
      });

      await project.save();

      // Populate the created project
      await project.populate("hackathon", "title status");
      await project.populate("team", "name");
      await project.populate("builders.user", "displayName photoURL");

      res.status(201).json({
        success: true,
        message: "Project created successfully",
        data: { project },
      });
    } catch (error) {
      console.error("Create project error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create project",
      });
    }
  },

  // Update project
  async updateProject(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user._id;
      const updateData = req.body;

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          error: "Project not found",
        });
      }

      // Check if user has permission to update
      const isBuilder = project.builders?.some(
        (builder) => builder.user.toString() === userId.toString()
      );
      const isCreator = project.creator?.toString() === userId.toString();

      if (!isBuilder && !isCreator) {
        return res.status(403).json({
          success: false,
          error: "You do not have permission to update this project",
        });
      }

      // Check if project can be updated (not judged yet)
      if (project.status === "judged") {
        return res.status(400).json({
          success: false,
          error: "Cannot update project after judging is complete",
        });
      }

      // Update project
      Object.assign(project, updateData);
      project.updatedAt = new Date();
      await project.save();

      // Populate updated project
      await project.populate("hackathon", "title status");
      await project.populate("team", "name");
      await project.populate("builders.user", "displayName photoURL");

      res.status(200).json({
        success: true,
        message: "Project updated successfully",
        data: { project },
      });
    } catch (error) {
      console.error("Update project error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update project",
      });
    }
  },

  // Delete project
  async deleteProject(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user._id;

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          error: "Project not found",
        });
      }

      // Check if user has permission to delete (only creator)
      const isCreator = project.creator?.toString() === userId.toString();

      if (!isCreator) {
        return res.status(403).json({
          success: false,
          error: "Only the project creator can delete this project",
        });
      }

      // Check if project can be deleted
      if (
        project.status === "submitted" ||
        project.status === "judging" ||
        project.status === "judged"
      ) {
        return res.status(400).json({
          success: false,
          error: "Cannot delete project after submission",
        });
      }

      await Project.findByIdAndDelete(projectId);

      res.status(200).json({
        success: true,
        message: "Project deleted successfully",
      });
    } catch (error) {
      console.error("Delete project error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete project",
      });
    }
  },

  // Submit project
  async submitProject(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user._id;

      const project = await Project.findById(projectId).populate("hackathon");
      if (!project) {
        return res.status(404).json({
          success: false,
          error: "Project not found",
        });
      }

      // Check if user has permission
      const isBuilder = project.builders?.some(
        (builder) => builder.user.toString() === userId.toString()
      );
      const isCreator = project.creator?.toString() === userId.toString();

      if (!isBuilder && !isCreator) {
        return res.status(403).json({
          success: false,
          error: "You do not have permission to submit this project",
        });
      }

      // Check if hackathon is still accepting submissions
      if (project.hackathon && project.hackathon.status !== "ongoing") {
        return res.status(400).json({
          success: false,
          error: "Hackathon is not accepting submissions",
        });
      }

      project.status = "submitted";
      project.submittedAt = new Date();
      await project.save();

      res.status(200).json({
        success: true,
        message: "Project submitted successfully",
        data: { project },
      });
    } catch (error) {
      console.error("Submit project error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to submit project",
      });
    }
  },

  // Unsubmit project (if allowed)
  async unsubmitProject(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user._id;

      const project = await Project.findById(projectId).populate("hackathon");
      if (!project) {
        return res.status(404).json({
          success: false,
          error: "Project not found",
        });
      }

      // Check if user has permission
      const isBuilder = project.builders?.some(
        (builder) => builder.user.toString() === userId.toString()
      );
      const isCreator = project.creator?.toString() === userId.toString();

      if (!isBuilder && !isCreator) {
        return res.status(403).json({
          success: false,
          error: "You do not have permission to unsubmit this project",
        });
      }

      // Check if project can be unsubmitted
      if (project.status === "judging" || project.status === "judged") {
        return res.status(400).json({
          success: false,
          error: "Cannot unsubmit project after judging has started",
        });
      }

      project.status = "draft";
      project.submittedAt = null;
      await project.save();

      res.status(200).json({
        success: true,
        message: "Project unsubmitted successfully",
        data: { project },
      });
    } catch (error) {
      console.error("Unsubmit project error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to unsubmit project",
      });
    }
  },

  // Add project image
  async addProjectImage(req, res) {
    try {
      const { projectId } = req.params;
      const { imageUrl, caption } = req.body;
      const userId = req.user._id;

      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          error: "Image URL is required",
        });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          error: "Project not found",
        });
      }

      // Check if user has permission
      const isBuilder = project.builders?.some(
        (builder) => builder.user.toString() === userId.toString()
      );
      const isCreator = project.creator?.toString() === userId.toString();

      if (!isBuilder && !isCreator) {
        return res.status(403).json({
          success: false,
          error: "You do not have permission to add images to this project",
        });
      }

      if (!project.images) {
        project.images = [];
      }

      const newImage = {
        url: imageUrl,
        caption: caption || "",
        uploadedBy: userId,
        uploadedAt: new Date(),
      };

      project.images.push(newImage);
      await project.save();

      res.status(201).json({
        success: true,
        message: "Image added successfully",
        data: {
          image: project.images[project.images.length - 1],
        },
      });
    } catch (error) {
      console.error("Add project image error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to add image",
      });
    }
  },

  // Remove project image
  async removeProjectImage(req, res) {
    try {
      const { projectId, imageId } = req.params;
      const userId = req.user._id;

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          error: "Project not found",
        });
      }

      // Check if user has permission
      const isBuilder = project.builders?.some(
        (builder) => builder.user.toString() === userId.toString()
      );
      const isCreator = project.creator?.toString() === userId.toString();

      if (!isBuilder && !isCreator) {
        return res.status(403).json({
          success: false,
          error:
            "You do not have permission to remove images from this project",
        });
      }

      if (!project.images) {
        return res.status(404).json({
          success: false,
          error: "Image not found",
        });
      }

      const initialLength = project.images.length;
      project.images = project.images.filter(
        (image) => image._id.toString() !== imageId
      );

      if (project.images.length === initialLength) {
        return res.status(404).json({
          success: false,
          error: "Image not found",
        });
      }

      await project.save();

      res.status(200).json({
        success: true,
        message: "Image removed successfully",
      });
    } catch (error) {
      console.error("Remove project image error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to remove image",
      });
    }
  },
};

module.exports = projectController;
