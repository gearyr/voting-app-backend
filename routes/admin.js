const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/role");
const requireRole = require("../middleware/role");

const router = express.Router();

// Get all users (admin only)
router.get("/users", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a user by Id (admin only)
router.delete("/users/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfuly" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit user's role
router.put("/users/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { role }, 
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
