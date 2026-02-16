const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");
const User = require("../models/User");

const router = express.Router();

// Test admin-only route
router.get("/test", protect, authorizeRoles("admin"), (req, res) => {
  res.json({
    success: true,
    message: "Admin Route Working! 🎉",
    user: req.user,
  });
});

// 📊 Get admin statistics (ADMIN only)
router.get("/statistics", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    // Get total hospitals
    const totalHospitals = await Hospital.countDocuments();

    // Get active (approved) hospitals
    const activeHospitals = await Hospital.countDocuments({ status: "approved" });

    // Get pending hospitals
    const pendingHospitals = await Hospital.countDocuments({ status: "pending" });

    // Get rejected hospitals (for completeness)
    const rejectedHospitals = await Hospital.countDocuments({ status: "rejected" });

    // Get total doctors (all doctors in the system)
    const totalDoctors = await Doctor.countDocuments();

    // Get total patients (users with role "patient")
    const totalPatients = await User.countDocuments({ role: "patient" });

    // Debug: Log the counts
    console.log("Admin Statistics:", {
      totalHospitals,
      activeHospitals,
      pendingHospitals,
      rejectedHospitals,
      totalDoctors,
      totalPatients,
    });

    res.json({
      success: true,
      data: {
        totalHospitals,
        activeHospitals,
        pendingHospitals,
        rejectedHospitals,
        totalDoctors,
        totalPatients,
      },
    });
  } catch (error) {
    console.error("Get admin statistics error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
