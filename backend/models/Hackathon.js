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
  description: {
    type: String,
    required: true,
  },
  theme: {
    type: String,
    enum: ["AI", "Fintech", "Healthcare", "Education", "Sustainability", "Other"],
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
  status: {
    type: String,
    enum: ["draft", "published", "ongoing", "completed"],
    default: "draft",
  },
  invitedJudges: [{ // Add this field
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  
  judges: [{ // Add this field for accepted judges
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
hackathonSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Hackathon = mongoose.model("Hackathon", hackathonSchema);

module.exports = Hackathon;
