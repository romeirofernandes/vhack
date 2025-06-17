const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  problemStatement: {
    type: String,
    trim: true
  },
  challenges: {
    type: String,
    trim: true
  },
  technologies: [{
    type: String,
    trim: true
  }],
  links: {
    github: { type: String, trim: true },
    live: { type: String, trim: true },
    video: { type: String, trim: true },
    presentation: { type: String, trim: true }
  },
  images: [{
    url: { type: String, required: true },
    caption: { type: String, default: '' }
  }],
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    default: null // null for personal projects, hackathon ID for hackathon submissions
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null // null for solo projects, team ID for team projects
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  builders: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['creator', 'collaborator'],
      default: 'collaborator'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'judging', 'judged'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  submittedAt: {
    type: Date,
    default: null
  },
  scores: [{
    judge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    criteria: [{
      name: { type: String, required: true },
      score: { type: Number, required: true, min: 0, max: 10 },
      feedback: { type: String, default: '' }
    }],
    totalScore: {
      type: Number,
      default: 0
    },
    feedback: {
      type: String,
      default: ''
    },
    scoredAt: {
      type: Date,
      default: Date.now
    }
  }],
  finalScore: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

// Calculate final score when scores are updated
projectSchema.pre('save', function(next) {
  if (this.scores && this.scores.length > 0) {
    const totalScore = this.scores.reduce((sum, score) => sum + score.totalScore, 0);
    this.finalScore = totalScore / this.scores.length;
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);