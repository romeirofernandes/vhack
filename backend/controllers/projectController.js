const Project = require("../models/Project");
const User = require("../models/User");
const Hackathon = require("../models/Hackathon");
const Team = require("../models/Team");
const { analyzeProject } = require("../services/aiJudgeService");

const projectController = {
  // Get user's projects + public projects
  async getProjects(req, res) {
    try {
      const userId = req.user._id;
      const {
        status,
        hackathon,
        page = 1,
        limit = 10,
        showPublic = false,
      } = req.query;

      let query;

      if (showPublic === "true") {
        // Show all public projects from all users
        query = { isPublic: true };
      } else {
        // Show user's own projects (both public and private)
        query = {
          $or: [{ "builders.user": userId }, { creator: userId }],
        };
      }

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
        images,
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
        images: images || [],
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

// Submit judge score
async submitJudgeScore(req, res) {
  try {
    const { projectId } = req.params;
    const { scores, feedback } = req.body;
    const userId = req.user._id;

    console.log('Submit score request:', { projectId, userId, scores: scores?.length });

    // Find the project
    const project = await Project.findById(projectId)
      .populate("hackathon", "title judges organizerId timelines")
      .populate("team", "name")
      .populate("builders.user", "displayName");

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found"
      });
    }

    // Check if user is authorized to judge this project
    const hackathon = project.hackathon;
    const isJudge = hackathon.judges?.some(judge => judge.toString() === userId.toString());
    const isOrganizer = hackathon.organizerId?.toString() === userId.toString();

    if (!isJudge && !isOrganizer) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to judge this project"
      });
    }

    // Check if judging period is open
    const now = new Date();
    const submissionDeadline = new Date(hackathon.timelines.hackathonEnd);
    
    if (now < submissionDeadline) {
      return res.status(400).json({
        success: false,
        error: "Judging period has not started yet"
      });
    }

    // Validate scores
    if (!scores || !Array.isArray(scores) || scores.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Scores are required"
      });
    }

    // Check if judge has already scored this project
    const existingScoreIndex = project.scores?.findIndex(
      score => score.judge.toString() === userId.toString()
    );

    // Calculate total score
    const totalScore = scores.reduce((sum, score) => sum + (score.score || 0), 0);

    const scoreData = {
      judge: userId,
      criteria: scores.map(score => ({
        title: score.title,
        score: score.score,
        maxScore: score.maxScore || 10
      })),
      totalScore,
      feedback: feedback || "",
      submittedAt: new Date()
    };

    if (existingScoreIndex >= 0) {
      // Update existing score
      project.scores[existingScoreIndex] = scoreData;
    } else {
      // Add new score
      if (!project.scores) {
        project.scores = [];
      }
      project.scores.push(scoreData);
    }

    // Update project status
    if (project.status === "submitted") {
      project.status = "judging";
    }

    await project.save();

    console.log('Score submitted successfully for project:', project.title);

    res.json({
      success: true,
      message: "Score submitted successfully",
      data: {
        score: scoreData,
        project: {
          id: project._id,
          title: project.title,
          finalScore: project.finalScore
        }
      }
    });

  } catch (error) {
    console.error("Submit judge score error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to submit score"
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

  async getSubmittedProjects (req, res) {
  try {
    const { hackathonId } = req.params;
    const userId = req.user._id;

    // Find hackathon and check permissions
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, error: "Hackathon not found" });
    }

    // Check if user is organizer or judge
    const isOrganizer = hackathon.organizerId.toString() === userId.toString();
    const isJudge = hackathon.judges.includes(userId);

    if (!isOrganizer && !isJudge) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    // Check if judging period has started (after submission deadline)
    const now = new Date();
    const submissionDeadline = new Date(hackathon.timelines.hackathonEnd);
    
    if (now < submissionDeadline && isJudge) {
      return res.status(400).json({ 
        success: false, 
        error: "Judging not open yet. Wait until submission deadline." 
      });
    }

    // Get submitted projects
    const projects = await Project.find({
      hackathon: hackathonId,
      status: { $in: ["submitted", "judging", "judged"] }
    })
    .populate("team", "name members")
    .populate("builders.user", "displayName email photoURL")
    .populate("scores.judge", "_id displayName email")
    .sort({ submittedAt: -1 });

    res.json({ 
      success: true, 
      data: { 
        projects,
        hackathon: {
          title: hackathon.title,
          judgingCriteria: hackathon.judgingCriteria || [],
          submissionDeadline: hackathon.timelines.hackathonEnd,
          judgingOpen: now >= submissionDeadline
        }
      }
    });
  } catch (error) {
    console.error("Error fetching submitted projects:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
},


// Submit judge score
async analyzeProjectWithAI(req, res) {
  try {
    const { projectId } = req.params;
    const { refresh } = req.query;
    const userId = req.user._id;

    console.log('AI Analysis requested for project:', projectId);
    console.log('User ID:', userId);

    // Find the project
    const project = await Project.findById(projectId)
      .populate("hackathon", "title judgingCriteria organizerId judges")
      .populate("team", "name members")
      .populate("builders.user", "displayName _id");

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found"
      });
    }

    console.log('Project found:', project.title);

    // Check if user has access (judge, organizer, or team member)
    const hackathon = project.hackathon;
    const isJudge = hackathon.judges?.some(judge => judge.toString() === userId.toString());
    const isOrganizer = hackathon.organizerId?.toString() === userId.toString();
    const isTeamMember = project.builders?.some(
      builder => builder.user._id.toString() === userId.toString()
    );

    console.log('Access check:');
    console.log('- Is Judge:', isJudge);
    console.log('- Is Organizer:', isOrganizer);
    console.log('- Is Team Member:', isTeamMember);

    if (!isJudge && !isOrganizer && !isTeamMember) {
      console.log('Access denied for user:', userId);
      return res.status(403).json({
        success: false,
        error: "Access denied"
      });
    }

    // Check for valid cached analysis
    const hasValidCachedAnalysis = project.aiAnalysis && 
      project.aiAnalysis.overallScore && 
      project.aiAnalysis.codeQualityMetrics &&
      Object.keys(project.aiAnalysis.codeQualityMetrics).length > 0 &&
      project.aiAnalysis.strengths &&
      project.aiAnalysis.strengths.length > 0;

    if (hasValidCachedAnalysis && !refresh) {
      console.log('Returning cached analysis');
      return res.json({
        success: true,
        data: project.aiAnalysis,
        cached: true
      });
    }

    console.log('Generating new AI analysis...');

    // Get GitHub URL
    const githubUrl = project.links?.github;
    if (!githubUrl) {
      return res.status(400).json({
        success: false,
        error: "Project must have a GitHub repository for AI analysis"
      });
    }

    console.log('Calling AI service for GitHub URL:', githubUrl);

    // **USE THE ACTUAL AI SERVICE HERE**
    const analysisResult = await analyzeProject(githubUrl, hackathon.judgingCriteria || []);

    if (!analysisResult.success) {
      console.error('AI service error:', analysisResult.error);
      return res.status(500).json({
        success: false,
        error: analysisResult.error || "AI analysis failed"
      });
    }

    console.log('AI service completed successfully:', {
      overallScore: analysisResult.analysis?.overallScore,
      hasAnalysis: !!analysisResult.analysis
    });

    // Map AI service results to our expected format
    const aiData = analysisResult.analysis;
    const repoData = analysisResult.repositoryData;

    const formattedAnalysisData = {
      overallScore: aiData.overallScore || 75,
      confidenceLevel: 90, // High confidence since it's from real AI analysis
      analyzedAt: new Date(),
      repositoryUrl: githubUrl,
      
      codeQualityMetrics: {
        structureQuality: Math.round((aiData.technicalQuality?.score || 75) / 10),
        documentationQuality: Math.round((aiData.documentation?.score || 70) / 10),
        testingCoverage: 6, // Default since not in AI response
        architectureDesign: Math.round((aiData.functionality?.score || 75) / 10)
      },
      
      // Map judging criteria to AI analysis scores
      criteriaScores: hackathon.judgingCriteria?.map((criteria) => {
        let score = 7; // default
        const maxScore = criteria.maxScore || 10;
        
        // Match criteria with AI analysis
        const criteriaLower = criteria.title.toLowerCase();
        if (criteriaLower.includes('technical') || criteriaLower.includes('implementation')) {
          score = Math.round((aiData.technicalQuality?.score || 70) * maxScore / 100);
        } else if (criteriaLower.includes('innovation') || criteriaLower.includes('creativity')) {
          score = Math.round((aiData.innovation?.score || 80) * maxScore / 100);
        } else if (criteriaLower.includes('functionality') || criteriaLower.includes('features')) {
          score = Math.round((aiData.functionality?.score || 75) * maxScore / 100);
        } else if (criteriaLower.includes('documentation')) {
          score = Math.round((aiData.documentation?.score || 70) * maxScore / 100);
        }
        
        return {
          title: criteria.title,
          description: criteria.description,
          maxScore: maxScore,
          score: Math.min(score, maxScore),
          feedback: `AI Analysis: ${aiData.summary || 'Well-executed project with good technical implementation.'}`
        };
      }) || [
        {
          title: "Technical Implementation",
          maxScore: 10,
          score: Math.round((aiData.technicalQuality?.score || 75) / 10),
          feedback: aiData.technicalQuality?.examples?.join('. ') || "Strong technical implementation."
        },
        {
          title: "Innovation",
          maxScore: 10,
          score: Math.round((aiData.innovation?.score || 80) / 10),
          feedback: aiData.innovation?.examples?.join('. ') || "Innovative approach with creative solutions."
        },
        {
          title: "Documentation",
          maxScore: 10,
          score: Math.round((aiData.documentation?.score || 70) / 10),
          feedback: aiData.documentation?.examples?.join('. ') || "Good documentation quality."
        },
        {
          title: "Functionality",
          maxScore: 10,
          score: Math.round((aiData.functionality?.score || 75) / 10),
          feedback: aiData.functionality?.examples?.join('. ') || "Solid functionality implementation."
        }
      ],
      
      // Use AI analysis results
      strengths: [
        ...(aiData.technicalQuality?.strengths || []),
        ...(aiData.innovation?.strengths || []),
        ...(aiData.documentation?.strengths || []),
        ...(aiData.functionality?.strengths || [])
      ].slice(0, 5), // Limit to 5 items
      
      improvements: [
        ...(aiData.technicalQuality?.improvements || []),
        ...(aiData.innovation?.improvements || []),
        ...(aiData.documentation?.improvements || []),
        ...(aiData.functionality?.improvements || [])
      ].slice(0, 5), // Limit to 5 items
      
      technicalHighlights: aiData.keyHighlights || [
        "Modern development practices",
        "Clean architecture",
        "Good code organization"
      ],
      
      innovationFactors: aiData.innovation?.strengths || [
        "Creative problem solving",
        "Novel approach",
        "Unique features"
      ],
      
      recommendation: aiData.summary || "Well-executed project with solid technical implementation and innovative features.",
      
      repository: {
        name: repoData?.name || project.title,
        language: repoData?.language || "JavaScript",
        stars: repoData?.stars || 0,
        forks: repoData?.forks || 0,
        description: repoData?.description || project.description
      }
    };

    console.log('Formatted analysis data:', {
      overallScore: formattedAnalysisData.overallScore,
      strengthsCount: formattedAnalysisData.strengths.length,
      criteriaCount: formattedAnalysisData.criteriaScores.length
    });

    // Save analysis to project
    project.aiAnalysis = formattedAnalysisData;
    await project.save();

    console.log('AI analysis saved successfully');

    res.json({
      success: true,
      data: formattedAnalysisData,
      cached: false
    });

  } catch (error) {
    console.error("AI Analysis error:", error);
    
    // Check if it's a GitHub API error
    if (error.message.includes('GitHub') || error.message.includes('repository')) {
      return res.status(400).json({
        success: false,
        error: "Failed to access GitHub repository. Please check if the repository is public and the URL is correct."
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Failed to analyze project with AI: " + error.message
    });
  }
},
  
};



module.exports = projectController;
