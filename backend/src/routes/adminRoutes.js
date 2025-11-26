const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Test admin-only route
router.get("/test", protect, authorizeRoles("admin"), (req, res) => {
  res.json({
    success: true,
    message: "Admin Route Working! 🎉",
    user: req.user,
  });
});

module.exports = router;
