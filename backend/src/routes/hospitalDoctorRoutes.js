const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const Doctor = require("../models/Doctor");
const Department = require("../models/Department");

const router = express.Router();

// 📋 Get all departments with their doctors (HOSPITAL only) - MUST come before "/" route
router.get("/departments", protect, authorizeRoles("hospital"), async (req, res) => {
  try {
    const hospitalId = req.user.id;
    console.log("Fetching departments for hospital:", hospitalId);
    
    // Get all departments for this hospital (including inactive for now, can filter later)
    const departments = await Department.find({ hospital: hospitalId }).sort({ name: 1 });
    console.log("Found departments:", departments.length);
    
    // Get all doctors for this hospital grouped by department
    const doctors = await Doctor.find({ hospital: hospitalId })
      .populate("department", "name description")
      .sort({ name: 1 });
    console.log("Found doctors:", doctors.length);
    
    // Group doctors by department
    const departmentsWithDoctors = departments.map(dept => {
      const deptDoctors = doctors.filter(doc => 
        doc.department && doc.department._id && doc.department._id.toString() === dept._id.toString()
      );
      return {
        ...dept.toObject(),
        doctors: deptDoctors,
        doctorCount: deptDoctors.length
      };
    });

    console.log("Departments with doctors:", departmentsWithDoctors.length);
    res.json({ success: true, data: departmentsWithDoctors });
  } catch (error) {
    console.error("Get departments with doctors error:", error);
    res.status(500).json({ message: error.message, error: process.env.NODE_ENV === "development" ? error.stack : undefined });
  }
});

// 📋 Get all doctors for the logged-in hospital
router.get("/", protect, authorizeRoles("hospital"), async (req, res) => {
  try {
    const hospitalId = req.user.id;
    const doctors = await Doctor.find({ hospital: hospitalId })
      .populate("department", "name description")
      .sort({ name: 1 });
    res.json({ success: true, data: doctors });
  } catch (error) {
    console.error("Get hospital doctors error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ➕ Add doctor to department (HOSPITAL only)
router.post("/add", protect, authorizeRoles("hospital"), async (req, res) => {
  try {
    const { name, speciality, phone, email, departmentId } = req.body;
    const hospitalId = req.user.id;

    if (!name || !departmentId) {
      return res.status(400).json({ message: "Name and department are required" });
    }

    // Verify department belongs to the hospital
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    if (department.hospital.toString() !== hospitalId) {
      return res.status(403).json({ message: "Not authorized to add doctors to this department" });
    }

    // Create doctor
    const doctor = await Doctor.create({
      name,
      speciality: speciality || "",
      phone: phone || "",
      email: email || "",
      hospital: hospitalId,
      department: departmentId,
      createdBy: req.user.id,
      status: "active",
    });

    res.status(201).json({
      success: true,
      data: doctor,
      message: "Doctor added successfully",
    });
  } catch (error) {
    console.error("Add doctor error:", error);
    res.status(500).json({ message: error.message });
  }
});

// 🔁 Update doctor (HOSPITAL only)
router.put("/:id", protect, authorizeRoles("hospital"), async (req, res) => {
  try {
    const { name, speciality, phone, email, departmentId, status } = req.body;
    const hospitalId = req.user.id;
    const doctorId = req.params.id;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Verify doctor belongs to the hospital
    if (doctor.hospital.toString() !== hospitalId) {
      return res.status(403).json({ message: "Not authorized to update this doctor" });
    }

    // If department is being changed, verify it belongs to the hospital
    if (departmentId && departmentId !== doctor.department?.toString()) {
      const department = await Department.findById(departmentId);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      if (department.hospital.toString() !== hospitalId) {
        return res.status(403).json({ message: "Not authorized to assign doctor to this department" });
      }
      doctor.department = departmentId;
    }

    if (name !== undefined) doctor.name = name;
    if (speciality !== undefined) doctor.speciality = speciality;
    if (phone !== undefined) doctor.phone = phone;
    if (email !== undefined) doctor.email = email;
    if (status !== undefined && ["active", "inactive"].includes(status)) {
      doctor.status = status;
    }

    const updated = await doctor.save();
    res.json({
      success: true,
      data: updated,
      message: "Doctor updated successfully",
    });
  } catch (error) {
    console.error("Update doctor error:", error);
    res.status(500).json({ message: error.message });
  }
});

// 🗑 Delete doctor (HOSPITAL only)
router.delete("/:id", protect, authorizeRoles("hospital"), async (req, res) => {
  try {
    const hospitalId = req.user.id;
    const doctorId = req.params.id;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Verify doctor belongs to the hospital
    if (doctor.hospital.toString() !== hospitalId) {
      return res.status(403).json({ message: "Not authorized to delete this doctor" });
    }

    await Doctor.findByIdAndDelete(doctorId);
    res.json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    console.error("Delete doctor error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

