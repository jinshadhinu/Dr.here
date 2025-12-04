const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const Hospital = require("../models/Hospital");

const router = express.Router();

// ADMIN → GET ALL HOSPITALS
router.get("/hospitals", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: hospitals,
    });
  } catch (err) {
    console.error("Admin get hospitals error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ADMIN → APPROVE HOSPITAL
router.put("/hospitals/approve/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    hospital.status = "approved";
    await hospital.save();

    res.json({
      success: true,
      message: "Hospital approved",
      data: hospital,
    });
  } catch (err) {
    console.error("Approve hospital error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ADMIN → REJECT HOSPITAL
router.put("/hospitals/reject/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    hospital.status = "rejected";
    await hospital.save();

    res.json({
      success: true,
      message: "Hospital rejected",
      data: hospital,
    });
  } catch (err) {
    console.error("Reject hospital error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
