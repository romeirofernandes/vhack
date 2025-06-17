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
  rank: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

// Calculate final score when scores are updated
projectSchema.pre('save', function(next) {
  console.log('Pre-save hook triggered. Scores:', this.scores?.length || 0);
  
  if (this.scores && this.scores.length > 0) {
    // Calculate average score from all judges
    const totalScore = this.scores.reduce((sum, score) => {
      console.log('Judge score:', score.totalScore);
      return sum + (score.totalScore || 0);
    }, 0);
    
    this.finalScore = Number((totalScore / this.scores.length).toFixed(2));
    console.log('Calculated final score:', this.finalScore);
    
    // Update status if all judges have scored
    if (this.status !== 'judged') {
      // You can add logic here to check if all assigned judges have scored
      this.status = 'judging'; // Keep as judging until all judges complete
    }
  } else {
    this.finalScore = 0;
  }
  
  next();
});

module.exports = mongoose.model('Project', projectSchema);