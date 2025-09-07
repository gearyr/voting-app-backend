const express = require("express");
const Vote = require("../models/Vote");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");
const router = express.Router();

//Vote
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    let vote = await Vote.findOne({ name });

    if (!vote) {
      vote = new Vote({ name, votes: 1 });
    } else {
      vote.votes += 1;
    }

    await vote.save();
    res.json({ message: "Vote Recorded", vote });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// see result
router.get("/results", async (req, res) => {
  try {
    const results = await Vote.find().sort({ votes: -1 });
    res.json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// admin summary
router.get("/summary", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const totalVotes = await Vote.aggregate([{ $group: { _id: null, total: { $sum: "$votes" } } }]);
    const summary = await Vote.find().sort({ votes: -1 });
    res.json({
      totalVotes: totalVotes[0]?.total || 0,
      votes: summary,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
