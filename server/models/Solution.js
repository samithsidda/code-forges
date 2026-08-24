const mongoose = require("mongoose");

const solutionSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    language: {
      type: String,
      enum: ["Java", "Python", "C", "C++", "JavaScript"],
      required: true,
    },

    sourceCode: {
      type: String,
      default: "",
    },

    stdin: {
      type: String,
      default: "",
    },

    stdout: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      default: "Pending",
    },

    time: {
      type: String,
      default: "",
    },

    memory: {
      type: String,
      default: "",
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Solution", solutionSchema);