const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  photoURL: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ["participant", "judge", "organizer"],
    default: null,
  },
  profile: {
    // For participants
    skills: [String],
    experience: String,
    github: String,
    linkedin: String,
    portfolio: String,
    bio: String,

    // For organizers
    company: String,
    position: String,
    website: String,

    // For judges
    expertise: [String],
    organization: String,
    yearsOfExperience: Number,

    // Common fields
    firstName: String,
    lastName: String,
    location: String,
    // ...other fields can be added as needed
  },

  profileCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
