const express = require("express");
const bcrypt = require("bcryptjs");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const Hospital = require("../models/Hospital");

const router = express.Router();

// 🔐 Change password (HOSPITAL only)
router.put("/change-password", protect, authorizeRoles("hospital"), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    // Get the hospital with password (we need it to verify)
    const hospital = await Hospital.findById(req.user.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, hospital.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    hospital.password = hashedPassword;
    await hospital.save();

    res.json({ 
      success: true, 
      message: "Password changed successfully" 
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: error.message });
  }
});

// 📄 Get hospital profile (HOSPITAL only)
router.get("/profile", protect, authorizeRoles("hospital"), async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.user.id).select("-password");
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    res.json({ success: true, data: hospital });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📊 Get hospital statistics (HOSPITAL only)
router.get("/statistics", protect, authorizeRoles("hospital"), async (req, res) => {
  try {
    const Doctor = require("../models/Doctor");
    const hospitalId = req.user.id;

    // Get total doctors for this hospital
    const totalDoctors = await Doctor.countDocuments({ 
      hospital: hospitalId,
      status: "active"
    });

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count today's appointments (if Appointment model exists)
    // For now, we'll check booked slots in doctors
    let todaysAppointments = 0;
    try {
      const doctors = await Doctor.find({ hospital: hospitalId });
      doctors.forEach(doctor => {
        if (doctor.slots && Array.isArray(doctor.slots)) {
          const todayBooked = doctor.slots.filter(slot => {
            const slotDate = new Date(slot.date);
            return slotDate >= today && 
                   slotDate < tomorrow && 
                   slot.isBooked === true;
          });
          todaysAppointments += todayBooked.length;
        }
      });
    } catch (err) {
      console.log("Error counting appointments:", err.message);
    }

    // Count total patients (unique patients who have appointments)
    // For now, we'll use a placeholder - you can enhance this when you have an Appointment model
    let totalPatients = 0;
    try {
      const doctors = await Doctor.find({ hospital: hospitalId });
      const bookedSlots = doctors.flatMap(doctor => 
        (doctor.slots || []).filter(slot => slot.isBooked === true)
      );
      // Count unique patients (if you store patient info in slots)
      // For now, return count of booked appointments as placeholder
      totalPatients = bookedSlots.length;
    } catch (err) {
      console.log("Error counting patients:", err.message);
    }

    res.json({
      success: true,
      data: {
        todaysAppointments,
        totalDoctors,
        totalPatients
      }
    });
  } catch (error) {
    console.error("Get statistics error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

