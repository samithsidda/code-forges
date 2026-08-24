const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },

    inputFormat: {
      type: String,
    },

    outputFormat: {
      type: String,
    },

    constraints: {
      type: String,
    },

    sampleInput: {
      type: String,
    },

    sampleOutput: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Problem", problemSchema);