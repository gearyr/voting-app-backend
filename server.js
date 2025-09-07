require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const authMiddleware = require("./middleware/auth");
app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: `Hello ${req.user.role}!` });
});

//Connect to MongoDB
if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB Connection Error: ", err));

  // Start server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
  });
}

const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);

const voteRoutes = require("./routes/vote");
app.use("/vote", voteRoutes);

module.exports = app;
