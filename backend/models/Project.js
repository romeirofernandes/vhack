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
    required: true,
  },
  problemStatement: {
    type: String,
    required: true,
  },
  challenges: {
    type: String,
    required: true,
  },
  technologies: [
    {
      type: String,
      required: true,
    },
  ],
  links: {
    github: String,
    demo: String,
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
