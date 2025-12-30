const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const Department = require("../models/Department");

const router = express.Router();

// Test route to verify department routes are working
router.get("/test", (req, res) => {
  res.json({ message: "Department routes are working!", path: "/api/hospital/departments" });
});

// ➕ Add department (HOSPITAL only) - MUST be before /:id route
router.post("/add", protect, authorizeRoles("hospital"), async (req, res) => {
  try {
    const { name, description } = req.body;
    const hospitalId = req.user.id;

    // Validate name
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ message: "Department name is required" });
    }

    const trimmedName = name.trim();

    // Check if department with same name already exists for this hospital
    const existing = await Department.findOne({
      name: trimmedName,
      hospital: hospitalId,
    });

    if (existing) {
      return res.status(400).json({ message: "Department with this name already exists" });
    }

    // Create department - description is optional
    const department = await Department.create({
      name: trimmedName,
      description: description && typeof description === "string" ? description.trim() : "",
      hospital: hospitalId,
      status: "active",
    });

    res.status(201).json({
      success: true,
      data: department,
      message: "Department added successfully",
    });
  } catch (error) {
    console.error("Add department error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Department with this name already exists" });
    }
    res.status(500).json({ 
      message: error.message || "Failed to add department",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

// 📋 Get all departments for the logged-in hospital (HOSPITAL only)
router.get("/", protect, authorizeRoles("hospital"), async (req, res) => {
  try {
    const hospitalId = req.user.id;
    const departments = await Department.find({ hospital: hospitalId }).sort({ name: 1 });
    res.json({ success: true, data: departments });
  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).json({ message: error.message });
  }
});

// 📄 Get single department (HOSPITAL only) - MUST be after /add route
router.get("/:id", protect, authorizeRoles("hospital"), async (req, res) => {
  try {
    const hospitalId = req.user.id;
    const departmentId = req.params.id;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Verify department belongs to the hospital
    if (department.hospital.toString() !== hospitalId) {
      return res.status(403).json({ message: "Not authorized to view this department" });
    }

    res.json({ success: true, data: department });
  } catch (error) {
    console.error("Get department error:", error);
    res.status(500).json({ message: error.message });
  }
});

// 🔁 Update department (HOSPITAL only)
router.put("/:id", protect, authorizeRoles("hospital"), async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const hospitalId = req.user.id;
    const departmentId = req.params.id;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Verify department belongs to the hospital
    if (department.hospital.toString() !== hospitalId) {
      return res.status(403).json({ message: "Not authorized to update this department" });
    }

    // Check if new name conflicts with existing department
    if (name && name.trim() !== department.name) {
      const existing = await Department.findOne({
        name: name.trim(),
        hospital: hospitalId,
        _id: { $ne: departmentId },
      });

      if (existing) {
        return res.status(400).json({ message: "Department with this name already exists" });
      }
      department.name = name.trim();
    }

    if (description !== undefined) {
      department.description = description?.trim() || "";
    }

    if (status && ["active", "inactive"].includes(status)) {
      department.status = status;
    }

    const updated = await department.save();
    res.json({
      success: true,
      data: updated,
      message: "Department updated successfully",
    });
  } catch (error) {
    console.error("Update department error:", error);
    res.status(500).json({ message: error.message });
  }
});

// 🗑 Delete department (HOSPITAL only)
router.delete("/:id", protect, authorizeRoles("hospital"), async (req, res) => {
  try {
    const hospitalId = req.user.id;
    const departmentId = req.params.id;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Verify department belongs to the hospital
    if (department.hospital.toString() !== hospitalId) {
      return res.status(403).json({ message: "Not authorized to delete this department" });
    }

    await Department.findByIdAndDelete(departmentId);
    res.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Delete department error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

