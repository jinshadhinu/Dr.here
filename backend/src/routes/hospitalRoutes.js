const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const Hospital = require("../models/Hospital");

const router = express.Router();

// Quick test to confirm mounting
router.get("/test", (req, res) => res.json({ ok: true, where: "hospitals" }));

// ➕ Add hospital (ADMIN only)
router.post("/add", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const { name, address, phone, email } = req.body;

    const hospital = await Hospital.create({
      name,
      address,
      phone,
      email,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: hospital,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📄 Get all hospitals (ADMIN only)
router.get("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json({ success: true, data: hospitals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
