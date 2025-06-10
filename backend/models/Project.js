const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  thumbnailImage: {
    type: String,
    default: "https://via.placeholder.com/400x300?text=Project+Thumbnail",
  },
  images: [
    {
      url: {
        type: String,
        required: true,
      },
      publicId: String, // Cloudinary public ID for potential deletion
      caption: String,
      filename: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  problemStatement: {
    type: String,
    default: "",
  },
  challenges: {
    type: String,
    default: "",
  },
  technologies: [
    {
      type: String,
    },
  ],
  links: {
    github: String,
    demo: String,
    live: String,
    video: String,
    presentation: String,
    other: [String],
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
  },
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hackathon",
  },
  builders: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      role: String,
    },
  ],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["draft", "submitted", "judging", "judged"],
    default: "draft",
  },
  scores: [
    {
      judge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      criteria: [
        {
          name: String,
          score: Number,
          feedback: String,
        },
      ],
      totalScore: Number,
      overallFeedback: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  finalScore: Number,
  rank: Number,
  isPublic: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  submittedAt: Date,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Project", projectSchema);
