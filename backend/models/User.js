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
    type: mongoose.Schema.Types.Mixed,
    default: {},
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
