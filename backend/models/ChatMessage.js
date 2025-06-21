const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  hackathonId: {
    type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and String
    required: true,
  },
  sender: {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['organizer', 'judge'], required: true },
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema); 