const express = require("express");
const bcrypt = require("bcryptjs");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const Hospital = require("../models/Hospital");
const Appointment = require("../models/Appointment");
const User = require("../models/User");

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

    // Count today's appointments using Appointment model
    let todaysAppointments = 0;
    try {
      todaysAppointments = await Appointment.countDocuments({
        hospital: hospitalId,
        appointmentDate: {
          $gte: today,
          $lt: tomorrow,
        },
        status: { $ne: "cancelled" },
      });
    } catch (err) {
      console.log("Error counting appointments:", err.message);
    }

    // Count total unique patients who have appointments
    let totalPatients = 0;
    try {
      const uniquePatients = await Appointment.distinct("patient", {
        hospital: hospitalId,
        status: { $ne: "cancelled" },
      });
      totalPatients = uniquePatients.length;
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

// 📅 Get all appointments for hospital (HOSPITAL only)
router.get("/appointments", protect, authorizeRoles("hospital"), async (req, res) => {
  try {
    const hospitalId = req.user.id;
    
    const appointments = await Appointment.find({ hospital: hospitalId })
      .populate("patient", "name email phone")
      .populate("doctor", "name speciality")
      .sort({ appointmentDate: 1 });

    res.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({ message: error.message });
  }
});

// 📅 Update appointment status (HOSPITAL only)
router.put("/appointments/:id/status", protect, authorizeRoles("hospital"), async (req, res) => {
  try {
    const { status } = req.body;
    const hospitalId = req.user.id;

    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      hospital: hospitalId,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = status;
    await appointment.save();

    res.json({
      success: true,
      message: "Appointment status updated",
      data: appointment,
    });
  } catch (error) {
    console.error("Update appointment error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Debug endpoint to check database content
router.get("/debug", protect, authorizeRoles("hospital"), async (req, res) => {
  try {
    const hospitalId = req.user.id;
    
    // Get all users
    const allUsers = await User.find({}).select("name email role");
    const patients = allUsers.filter(user => user.role === 'patient');
    
    // Get all appointments for this hospital
    const appointments = await Appointment.find({ hospital: hospitalId })
      .populate("patient", "name email")
      .populate("doctor", "name");
    
    // Get patient IDs from appointments
    const patientIds = await Appointment.distinct("patient", {
      hospital: hospitalId,
      status: { $ne: "cancelled" },
    });

    console.log("Debug Info:", {
      hospitalId,
      totalUsers: allUsers.length,
      totalPatients: patients.length,
      totalAppointments: appointments.length,
      patientIdsFromAppointments: patientIds.length,
      appointments: appointments.map(apt => ({
        id: apt._id,
        patient: apt.patient,
        doctor: apt.doctor,
        status: apt.status,
        date: apt.appointmentDate
      }))
    });

    res.json({
      success: true,
      data: {
        hospitalId,
        totalUsers: allUsers.length,
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        patientIdsFromAppointments: patientIds.length,
        patients: patients,
        appointments: appointments.map(apt => ({
          id: apt._id,
          patient: apt.patient,
          doctor: apt.doctor,
          status: apt.status,
          date: apt.appointmentDate
        }))
      }
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Test endpoint to create sample appointment
router.post("/test-appointment", protect, authorizeRoles("hospital"), async (req, res) => {
  try {
    const hospitalId = req.user.id;
    
    // Find a patient and doctor for this hospital
    const patient = await User.findOne({ role: "patient" });
    const doctor = await Doctor.findOne({ hospital: hospitalId });
    
    if (!patient || !doctor) {
      return res.status(400).json({ 
        message: "Need at least one patient and one doctor to create test appointment" 
      });
    }
    
    // Create a test appointment
    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctor._id,
      hospital: hospitalId,
      appointmentDate: new Date(),
      status: "pending",
      notes: "Test appointment for debugging"
    });
    
    res.json({
      success: true,
      message: "Test appointment created successfully",
      data: appointment
    });
  } catch (error) {
    console.error("Test appointment error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Test endpoint to create sample patient
router.post("/test-patient", protect, authorizeRoles("hospital"), async (req, res) => {
  try {
    // Create a test patient
    const patient = await User.create({
      name: "Test Patient " + Math.floor(Math.random() * 1000),
      email: "testpatient" + Math.floor(Math.random() * 1000) + "@test.com",
      password: "password123",
      role: "patient",
      phone: "+91" + Math.floor(Math.random() * 10000000000)
    });
    
    res.json({
      success: true,
      message: "Test patient created successfully",
      data: patient
    });
  } catch (error) {
    console.error("Test patient error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all patients for hospital (HOSPITAL only)
router.get("/patients", protect, authorizeRoles("hospital"), async (req, res) => {
  try {
    const hospitalId = req.user.id;
    
    console.log("Fetching all patients for hospital:", hospitalId);
    
    // Get ALL patients in the system (not just those with appointments)
    const allPatients = await User.find({ role: "patient" })
      .select("name email phone createdAt")
      .sort({ createdAt: -1 });

    console.log("Found all patients:", allPatients.length);

    // Get appointment statistics for each patient
    const patientsWithStats = await Promise.all(
      allPatients.map(async (patient) => {
        const appointmentCount = await Appointment.countDocuments({
          patient: patient._id,
          hospital: hospitalId,
        });

        const lastAppointment = await Appointment.findOne({
          patient: patient._id,
          hospital: hospitalId,
        }).sort({ createdAt: -1 });

        return {
          _id: patient._id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          createdAt: patient.createdAt,
          appointmentCount,
          lastAppointmentDate: lastAppointment?.appointmentDate || null,
          lastAppointmentStatus: lastAppointment?.status || null,
        };
      })
    );

    console.log("Patients with stats:", patientsWithStats.length);

    res.json({
      success: true,
      data: patientsWithStats,
    });
  } catch (error) {
    console.error("Get patients error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

