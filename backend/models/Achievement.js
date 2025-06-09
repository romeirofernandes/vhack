const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "beginner",
        "participation",
        "submission",
        "collaboration",
        "expertise",
        "milestone",
        "special",
      ],
      required: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    rarity: {
      type: String,
      enum: ["common", "rare", "epic", "legendary"],
      default: "common",
    },
    requirements: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Achievement", achievementSchema);