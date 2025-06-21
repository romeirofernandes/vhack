const ChatMessage = require('../models/ChatMessage');
const mongoose = require('mongoose');

// Get all chat messages for a hackathon
exports.getChatHistory = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    
    // Handle both string and ObjectId formats
    let objectId;
    if (mongoose.Types.ObjectId.isValid(hackathonId)) {
      objectId = new mongoose.Types.ObjectId(hackathonId);
    } else {
      // If it's not a valid ObjectId, try to find messages with string hackathonId
      objectId = hackathonId;
    }
    
    // Query for messages with both ObjectId and string formats
    const messages = await ChatMessage.find({
      $or: [
        { hackathonId: objectId },
        { hackathonId: hackathonId }
      ]
    }).sort({ createdAt: 1 });
    
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch chat history' });
  }
};

// Save a new chat message
exports.saveMessage = async ({ hackathonId, sender, message }) => {
  try {
    // Always save with the original hackathonId format for consistency
    const chatMessage = new ChatMessage({ hackathonId, sender, message });
    await chatMessage.save();
    return chatMessage;
  } catch (err) {
    // Log error but don't throw to avoid crashing socket
    console.error('Error saving chat message:', err);
    return null;
  }
};

// Validate sender object
function isValidSender(sender) {
  return sender && sender.userId && sender.name && sender.role;
}
exports.isValidSender = isValidSender;

// Socket.io logic
exports.initSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('join_hackathon_room', ({ hackathonId }) => {
      socket.join(hackathonId);
    });

    socket.on('hackathon_message', async ({ hackathonId, sender, message }) => {
      if (!isValidSender(sender)) {
        console.warn('Invalid sender object in hackathon_message:', sender);
        return;
      }
      const saved = await exports.saveMessage({ hackathonId, sender, message });
      if (saved) {
        io.to(hackathonId).emit('hackathon_message', saved);
      }
    });
  });
}; 