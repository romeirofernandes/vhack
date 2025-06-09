const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["participant", "judge", "organizer"],
      required: false, // Role is optional initially
      default: null, // Default to null until set
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    profile: {
      firstName: String,
      lastName: String,
      bio: String,
      location: String,
      company: String,
      jobTitle: String,
      experience: String,
      skills: [String], // Simple array of strings
      education: [
        {
          institution: String,
          degree: String,
          field: String,
          startYear: String,
          endYear: String,
          current: Boolean,
          id: Number,
        },
      ],
      socialLinks: {
        github: String,
        linkedin: String,
        portfolio: String,
        twitter: String,
      },
      achievements: [
        {
          title: String,
          description: String,
          type: String,
          date: String,
          id: Number,
        },
      ],
      expertise: [String],
      organization: String,
      yearsOfExperience: String,
      website: String,
      position: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
