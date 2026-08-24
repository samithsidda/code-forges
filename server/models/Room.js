const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    language: {
      type: String,
      enum: ["Java", "Python", "C", "C++", "JavaScript"],
      default: "Java",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    mode: {
      type: String,
      enum: ["practice", "collaboration"],
      default: "practice",
    },

    isPrivate: {
      type: Boolean,
      default: false,
    },

    roomCode: {
      type: String,
      unique: true,
      required: true,
    },

    status: {
      type: String,
      enum: ["waiting", "active", "completed"],
      default: "waiting",
    },

    revealSolutions: {
      type: Boolean,
      default: false,
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Room", roomSchema);