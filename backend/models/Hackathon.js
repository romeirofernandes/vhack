const mongoose = require("mongoose");

const hackathonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "judging", "completed", "cancelled"],
    default: "upcoming",
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  registrationDeadline: {
    type: Date,
    required: true,
  },
  submissionDeadline: {
    type: Date,
    required: true,
  },
  maxParticipants: {
    type: Number,
    default: null,
  },
  maxTeamSize: {
    type: Number,
    default: 4,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  teams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
  ],
  projects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
  ],
  themes: [String],
  prizes: [
    {
      position: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      description: String,
    },
  ],
  rules: String,
  requirements: [String],
  judgesCriteria: [
    {
      name: String,
      weight: Number,
      description: String,
    },
  ],
  judges: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  isPublic: {
    type: Boolean,
    default: true,
  },
  bannerImage: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Hackathon", hackathonSchema);
