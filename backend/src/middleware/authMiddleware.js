const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Hospital = require("../models/Hospital");

// Protect routes
const protect = async (req, res, next) => {
  let token;

  console.log("Auth middleware - Headers:", req.headers.authorization);
  
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Auth middleware - Token extracted:", token);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Auth middleware - Decoded token:", decoded);
      
      // Check if it's a hospital or user based on role
      if (decoded.role === "hospital") {
        req.user = await Hospital.findById(decoded.id).select("-password");
      } else {
        req.user = await User.findById(decoded.id).select("-password");
      }

      console.log("Auth middleware - User found:", req.user);

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      console.error("Auth middleware - Error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Role-based access
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
