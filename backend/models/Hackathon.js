const mongoose = require("mongoose");

const hackathonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  organizerName: {
    type: String,
    required: true,
    trim: true,
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  problemStatements: {
    type: String,
    required: true,
  },
  theme: {
    type: String,
    enum: [
      "AI",
      "Fintech",
      "Healthcare",
      "Education",
      "Sustainability",
      "Other",
    ],
    default: "Other",
  },
  bannerImageUrl: {
    type: String,
  },
  timelines: {
    registrationStart: {
      type: Date,
      required: true,
    },
    registrationEnd: {
      type: Date,
      required: true,
    },
    hackathonStart: {
      type: Date,
      required: true,
    },
    hackathonEnd: {
      type: Date,
      required: true,
    },
    resultsDate: {
      type: Date,
    },
  },
  teamSettings: {
    minTeamSize: {
      type: Number,
      required: true,
      min: 1,
    },
    maxTeamSize: {
      type: Number,
      required: true,
      min: 1,
    },
    allowSolo: {
      type: Boolean,
      default: false,
    },
  },
  prizes: {
    firstPrize: {
      type: String,
      required: true,
    },
    secondPrize: {
      type: String,
      required: true,
    },
    thirdPrize: {
      type: String,
      required: true,
    },
    participantPrize: {
      type: String,
      required: true,
    },
  },
  judgingCriteria: [
    {
      title: { type: String, required: true },
      description: { type: String },
      weight: { type: Number, default: 1 },
      maxScore: { type: Number, default: 10 },
    },
  ],
  status: {
    type: String,
    enum: [
      "draft",
      "pending_approval",
      "published",
      "upcoming",
      "ongoing",
      "completed",
      "cancelled",
    ],
    default: "draft",
  },
  invitedJudges: [
    {
      // Add this field
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  judges: [
    {
      // Add this field for accepted judges
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  resultsPublished: {
    type: Boolean,
    default: false,
  },
  resultsPublishedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  approvedAt: {
    type: Date,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  rejectedAt: {
    type: Date,
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  rejectionReason: {
    type: String,
  },
  // Add announcements array
  announcements: [
    {
      message: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      author: { type: String, default: 'Organizer' },
    }
  ]
});

// Update the updatedAt timestamp before saving
hackathonSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if hackathon is ready for approval
hackathonSchema.methods.checkForApproval = function () {
  // Check if hackathon has at least one judge and all invited judges have accepted
  const hasJudges = this.judges && this.judges.length > 0;
  const noInvitedJudges =
    !this.invitedJudges || this.invitedJudges.length === 0;

  if (hasJudges && noInvitedJudges && this.status === "draft") {
    this.status = "pending_approval";
    return this.save();
  }

  return Promise.resolve(this);
};

// Add a middleware to automatically check for approval when judges array is modified
hackathonSchema.pre("save", function (next) {
  if (this.isModified("judges") || this.isModified("invitedJudges")) {
    // Check if all judges have accepted (no pending invitations)
    const hasJudges = this.judges && this.judges.length > 0;
    const noInvitedJudges =
      !this.invitedJudges || this.invitedJudges.length === 0;

    if (hasJudges && noInvitedJudges && this.status === "draft") {
      this.status = "pending_approval";
    }
  }
  next();
});

const Hackathon = mongoose.model("Hackathon", hackathonSchema);

module.exports = Hackathon;
