const mongoose = require('mongoose');
const Hackathon = require('./Hackathon'); // Assuming Hackathon model is in the same directory

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
  scores: [
  {
    judge: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    criteria: [
      {
        title: String,
        score: Number,
        maxScore: { type: Number, default: 10 }
      }
    ],
    totalScore: Number,
    feedback: String,
    submittedAt: { type: Date, default: Date.now }
  }
],
finalScore: {
    type: Number,
    default: 0,
    min: 0,
},
// Add this to your existing Project schema
aiAnalysis: {
  overallScore: { type: Number, min: 0, max: 100 },
  criteriaScores: [{
    title: String,
    score: Number,
    maxScore: Number,
    feedback: String
  }],
  strengths: [String],
  improvements: [String],
  technicalHighlights: [String],
  innovationFactors: [String],
  codeQualityMetrics: {
    structureQuality: { type: Number, min: 0, max: 10 },
    documentationQuality: { type: Number, min: 0, max: 10 },
    testingCoverage: { type: Number, min: 0, max: 10 },
    architectureDesign: { type: Number, min: 0, max: 10 }
  },
  recommendation: String,
  confidenceLevel: { type: Number, min: 0, max: 100 },
  analyzedAt: { type: Date, default: Date.now },
  repository: {
    name: String,
    description: String,
    language: String,
    stars: Number,
    forks: Number
  }
},
  rank: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

// Calculate final score when scores are updated
projectSchema.pre('save', async function(next) {
  console.log('Pre-save hook triggered. Scores:', this.scores?.length || 0);

  if (this.scores && this.scores.length > 0) {
    // Calculate average score from all judges
    const totalScore = this.scores.reduce((sum, score) => {
      console.log('Judge score:', score.totalScore);
      return sum + (score.totalScore || 0);
    }, 0);

    this.finalScore = Number((totalScore / this.scores.length).toFixed(2));
    console.log('Calculated final score:', this.finalScore);

    // Set status to 'judged' if at least one judge has scored
    this.status = 'judged';
  } else {
    this.finalScore = 0;
    this.status = 'judging';
  }
  next();
});


module.exports = mongoose.model('Project', projectSchema);