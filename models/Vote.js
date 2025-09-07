const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    votes: { type: Number, default: 0 },
    createdBy: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vote", voteSchema);
