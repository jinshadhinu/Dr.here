const express = require("express");
const bcrypt = require("bcryptjs");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const Hospital = require("../models/Hospital");

const router = express.Router();

// Quick test to confirm mounting
router.get("/test", (req, res) => res.json({ ok: true, where: "hospitals" }));

// ➕ Add hospital (ADMIN only)
router.post("/add", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const { name, address, phone, email, password } = req.body;
    if (!name || !address || !phone || !password) {
      return res.status(400).json({ message: "name, address, phone and password are required" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const hospital = await Hospital.create({
      name,
      address,
      phone,
      email,
      password: hashedPassword,
      status: "pending",
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
// Get single hospital by id (admin only) — useful for edit page
router.get("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });
    res.json({ success: true, data: hospital });
  } catch (err) {
    console.error("Get hospital error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// 🔁 Update hospital (admin only)
router.put("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const hospId = req.params.id;
    const { name, address, phone, email } = req.body;

    const hospital = await Hospital.findById(hospId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // Update fields if provided
    hospital.name = name ?? hospital.name;
    hospital.address = address ?? hospital.address;
    hospital.phone = phone ?? hospital.phone;
    hospital.email = email ?? hospital.email;

    const updated = await hospital.save();

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Update hospital error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// 🗑 Delete hospital (admin only)
router.delete("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const hospId = req.params.id;
    const hospital = await Hospital.findByIdAndDelete(hospId);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    // remove related docs
await Doctor.deleteMany({ hospital: hospId });
await Appointment.deleteMany({ hospital: hospId });


    res.json({ success: true, message: "Hospital deleted" });
  } catch (err) {
    console.error("Delete hospital error:", err.message);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
