const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ error: "Access Denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.user = decoded; // attach user info (id, role)
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid Token" });
  }
}

module.exports = authMiddleware;
