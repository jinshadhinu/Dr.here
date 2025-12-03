const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const Doctor = require("../models/Doctor");
const Hospital = require("../models/Hospital");

const router = express.Router();

// Add doctor (hospital or admin)
router.post("/add", protect, authorizeRoles("admin","hospital"), async (req, res) => {
  try {
    const { name, speciality, phone, email, hospitalId, slots } = req.body;

    // validate basic fields
    if (!name || !hospitalId) return res.status(400).json({ message: "name and hospitalId required" });

    // ensure hospital exists
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });

    // create doctor
    const doctor = await Doctor.create({
      name, speciality, phone, email,
      hospital: hospitalId,
      createdBy: req.user._id,
      slots: Array.isArray(slots) ? slots : []
    });

    res.status(201).json({ success: true, data: doctor });
  } catch (err) {
    console.error("Add doctor error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// Get doctors by hospital (public)
router.get("/byHospital/:hospitalId", async (req, res) => {
  try {
    const doctors = await Doctor.find({ hospital: req.params.hospitalId, status: "active" });
    res.json({ success: true, data: doctors });
  } catch (err) {
    console.error("Get doctors error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// Get single doctor (public)
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("hospital", "name address");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ success: true, data: doctor });
  } catch (err) {
    console.error("Get doctor error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// Update doctor (hospital/admin)
router.put("/:id", protect, authorizeRoles("admin","hospital"), async (req, res) => {
  try {
    const doc = await Doctor.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Doctor not found" });

    // Optional: restrict who can edit (only creator or admin)
    // if (doc.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin")
    //   return res.status(403).json({ message: "Not allowed" });

    const { name, speciality, phone, email, slots, status } = req.body;
    if (name !== undefined) doc.name = name;
    if (speciality !== undefined) doc.speciality = speciality;
    if (phone !== undefined) doc.phone = phone;
    if (email !== undefined) doc.email = email;
    if (status !== undefined) doc.status = status;
    if (Array.isArray(slots)) doc.slots = slots;

    const updated = await doc.save();
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Update doctor error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// Delete doctor (admin/hospital)
router.delete("/:id", protect, authorizeRoles("admin","hospital"), async (req, res) => {
  try {
    const deleted = await Doctor.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Doctor not found" });
    res.json({ success: true, message: "Doctor deleted" });
  } catch (err) {
    console.error("Delete doctor error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// Add slot to a doctor
router.post("/:id/slots", protect, authorizeRoles("admin","hospital"), async (req, res) => {
  try {
    const { date } = req.body; // ISO string or timestamp
    if (!date) return res.status(400).json({ message: "date is required" });

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    doctor.slots.push({ date: new Date(date) });
    await doctor.save();
    res.json({ success: true, data: doctor.slots });
  } catch (err) {
    console.error("Add slot error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// Get available slots for doctor (public)
router.get("/:id/slots", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const available = doctor.slots.filter(s => !s.isBooked);
    res.json({ success: true, data: available });
  } catch (err) {
    console.error("Get slots error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
