const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const Hospital = require("../models/Hospital");
const Doctor = require("../models/Doctor");
const Department = require("../models/Department");
const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");
const User = require("../models/User");
let Razorpay;

function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;

  if (!Razorpay) {
    // Lazy require so the app still starts even if dependency isn't installed yet.
    // (We'll install it as part of this change.)
    // eslint-disable-next-line global-require
    Razorpay = require("razorpay");
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

async function freeDoctorSlotIfNeeded(doctorId, slotDate) {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return;
  const slotDateObj = new Date(slotDate);
  const slot = doctor.slots.find((s) => {
    const slotTime = new Date(s.date).getTime();
    const requestedTime = slotDateObj.getTime();
    const timeDiff = Math.abs(slotTime - requestedTime);
    return timeDiff < 60000 && s.isBooked;
  });
  if (!slot) return;
  slot.isBooked = false;
  await doctor.save();
}

// Get all approved hospitals (PUBLIC - for patients to browse)
router.get("/hospitals", async (req, res) => {
  try {
    const hospitals = await Hospital.find({ status: "approved" })
      .select("-password")
      .sort({ name: 1 });
    res.json({ success: true, data: hospitals });
  } catch (error) {
    console.error("Get hospitals error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get single hospital details (PUBLIC)
router.get("/hospitals/:id", async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
      .select("-password");
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }
    res.json({ success: true, data: hospital });
  } catch (error) {
    console.error("Get hospital error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get departments for a hospital (PUBLIC)
router.get("/hospitals/:id/departments", async (req, res) => {
  try {
    const departments = await Department.find({ 
      hospital: req.params.id,
      status: "active"
    }).sort({ name: 1 });
    res.json({ success: true, data: departments });
  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get doctors for a hospital (PUBLIC)
router.get("/hospitals/:id/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find({ 
      hospital: req.params.id,
      status: "active"
    })
      .populate("department", "name")
      .select("-createdBy")
      .sort({ name: 1 });
    res.json({ success: true, data: doctors });
  } catch (error) {
    console.error("Get doctors error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get doctors for a specific department (PUBLIC)
router.get("/hospitals/:hospitalId/departments/:departmentId/doctors", async (req, res) => {
  try {
    const { hospitalId, departmentId } = req.params;
    const doctors = await Doctor.find({ 
      hospital: hospitalId,
      department: departmentId,
      status: "active"
    })
      .populate("department", "name")
      .select("-createdBy")
      .sort({ name: 1 });
    res.json({ success: true, data: doctors });
  } catch (error) {
    console.error("Get department doctors error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get patient appointments (PATIENT only)
router.get("/appointments", protect, authorizeRoles("patient"), async (req, res) => {
  try {
    const patientId = req.user.id;
    
    const appointments = await Appointment.find({ patient: patientId })
      .populate("doctor", "name speciality")
      .populate("hospital", "name address phone")
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

// Book an appointment (PATIENT only)
router.post("/book-appointment", protect, authorizeRoles("patient"), async (req, res) => {
  try {
    const { doctorId, slotDate, advanceAmount, paymentMethod } = req.body;
    const patientId = req.user.id;

    if (!doctorId || !slotDate) {
      return res.status(400).json({ message: "Doctor ID and slot date are required" });
    }

    // Require advance payment with minimum amount
    const numericAdvanceAmount = Number(advanceAmount);
    if (
      advanceAmount === undefined ||
      advanceAmount === null ||
      advanceAmount === "" ||
      Number.isNaN(numericAdvanceAmount) ||
      numericAdvanceAmount < 100
    ) {
      return res.status(400).json({
        message: "Advance payment of at least 100 is required to book an appointment",
      });
    }

    const method = paymentMethod || "cash";
    if (method === "online") {
      return res.status(400).json({
        message:
          "Online advance payment must be completed via Razorpay. Please click 'Book Appointment' after selecting Payment Method = Online.",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Find the slot
    const slotDateObj = new Date(slotDate);
    // Compare dates more flexibly (within 1 minute tolerance)
    const slot = doctor.slots.find(
      s => {
        const slotTime = new Date(s.date).getTime();
        const requestedTime = slotDateObj.getTime();
        const timeDiff = Math.abs(slotTime - requestedTime);
        return timeDiff < 60000 && !s.isBooked; // Within 1 minute
      }
    );

    if (!slot) {
      return res.status(400).json({ message: "Slot not available or already booked" });
    }

    // Mark slot as booked
    slot.isBooked = true;
    await doctor.save();

    // Create appointment record
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      hospital: doctor.hospital,
      appointmentDate: slotDateObj,
      status: "pending",
    });

    // Create a mandatory advance payment record
    let payment;
    const paymentStatus = method === "cash" ? "pending" : "success";

    try {
      payment = await Payment.create({
        patient: patientId,
        appointment: appointment._id,
        doctor: doctorId,
        hospital: doctor.hospital,
        amount: numericAdvanceAmount,
        method,
        type: "advance",
        status: paymentStatus,
        notes:
          method === "cash"
            ? "Advance to be collected in cash at hospital reception"
            : "",
      });
    } catch (paymentError) {
      // If payment fails, cancel the appointment and free the slot
      await Appointment.findByIdAndDelete(appointment._id);
      slot.isBooked = false;
      await doctor.save();
      console.error("Advance payment creation failed:", paymentError);
      return res
        .status(500)
        .json({ message: "Failed to process advance payment. Appointment not booked." });
    }

    res.json({
      success: true,
      message: "Appointment booked and advance payment recorded successfully",
      data: {
        appointment,
        payment,
      },
    });
  } catch (error) {
    console.error("Book appointment error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create Razorpay order for advance payment (PATIENT only)
router.post(
  "/razorpay/create-order",
  protect,
  authorizeRoles("patient"),
  async (req, res) => {
    let doctor;
    let appointment;
    let payment;

    try {
      const { doctorId, slotDate, advanceAmount } = req.body;
      const patientId = req.user.id;

      if (!doctorId || !slotDate) {
        return res
          .status(400)
          .json({ message: "Doctor ID and slot date are required" });
      }

      const numericAdvanceAmount = Number(advanceAmount);
      if (
        advanceAmount === undefined ||
        advanceAmount === null ||
        advanceAmount === "" ||
        Number.isNaN(numericAdvanceAmount) ||
        numericAdvanceAmount < 100
      ) {
        return res.status(400).json({
          message: "Advance payment of at least 100 is required to book an appointment",
        });
      }

      const razorpay = getRazorpayInstance();
      if (!razorpay) {
        return res.status(500).json({
          message:
            "Razorpay is not configured on the server. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
        });
      }

      doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      // Find the slot
      const slotDateObj = new Date(slotDate);
      const slot = doctor.slots.find((s) => {
        const slotTime = new Date(s.date).getTime();
        const requestedTime = slotDateObj.getTime();
        const timeDiff = Math.abs(slotTime - requestedTime);
        return timeDiff < 60000 && !s.isBooked;
      });

      if (!slot) {
        return res
          .status(400)
          .json({ message: "Slot not available or already booked" });
      }

      // Reserve slot before payment starts
      slot.isBooked = true;
      await doctor.save();

      appointment = await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        hospital: doctor.hospital,
        appointmentDate: slotDateObj,
        status: "pending",
      });

      payment = await Payment.create({
        patient: patientId,
        appointment: appointment._id,
        doctor: doctorId,
        hospital: doctor.hospital,
        amount: numericAdvanceAmount,
        method: "online",
        type: "advance",
        status: "pending",
        provider: "razorpay",
        currency: "INR",
        notes: "Awaiting Razorpay payment confirmation",
      });

      const order = await razorpay.orders.create({
        amount: Math.round(numericAdvanceAmount * 100),
        currency: "INR",
        receipt: `payment_${payment._id}`,
        notes: {
          appointmentId: String(appointment._id),
          paymentId: String(payment._id),
          patientId: String(patientId),
          doctorId: String(doctorId),
        },
      });

      payment.razorpayOrderId = order.id;
      await payment.save();

      res.json({
        success: true,
        message: "Razorpay order created",
        data: {
          keyId: process.env.RAZORPAY_KEY_ID,
          order,
          appointmentId: appointment._id,
          paymentId: payment._id,
        },
      });
    } catch (error) {
      console.error("Razorpay create order error:", error);

      // Rollback on any failure
      try {
        if (payment?._id) await Payment.findByIdAndDelete(payment._id);
        if (appointment?._id) await Appointment.findByIdAndDelete(appointment._id);
        if (doctor?._id && req.body?.slotDate) {
          await freeDoctorSlotIfNeeded(doctor._id, req.body.slotDate);
        }
      } catch (rollbackError) {
        console.error("Razorpay create order rollback error:", rollbackError);
      }

      res.status(500).json({ message: error.message });
    }
  }
);

// Verify Razorpay payment signature (PATIENT only)
router.post(
  "/razorpay/verify",
  protect,
  authorizeRoles("patient"),
  async (req, res) => {
    try {
      const {
        paymentId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
      } = req.body;

      if (!paymentId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ message: "Missing Razorpay verification fields" });
      }

      const payment = await Payment.findById(paymentId);
      if (!payment) return res.status(404).json({ message: "Payment not found" });

      if (String(payment.patient) !== String(req.user.id)) {
        return res.status(403).json({ message: "Not authorized to verify this payment" });
      }

      if (payment.method !== "online" || payment.provider !== "razorpay") {
        return res.status(400).json({ message: "This payment is not a Razorpay online payment" });
      }

      if (payment.status !== "pending") {
        return res.status(400).json({ message: `Payment is already ${payment.status}` });
      }

      if (!payment.razorpayOrderId || payment.razorpayOrderId !== razorpayOrderId) {
        return res.status(400).json({ message: "Razorpay order ID mismatch" });
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret) {
        return res.status(500).json({ message: "Razorpay secret is not configured on the server" });
      }

      const body = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        payment.status = "failed";
        payment.razorpayPaymentId = razorpayPaymentId;
        payment.razorpaySignature = razorpaySignature;
        await payment.save();

        const appointment = await Appointment.findById(payment.appointment);
        if (appointment) {
          appointment.status = "cancelled";
          await appointment.save();
          await freeDoctorSlotIfNeeded(appointment.doctor, appointment.appointmentDate);
        }

        return res.status(400).json({ message: "Invalid Razorpay signature" });
      }

      payment.status = "success";
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      await payment.save();

      const appointment = await Appointment.findById(payment.appointment);
      if (appointment) {
        appointment.status = "confirmed";
        await appointment.save();
      }

      res.json({
        success: true,
        message: "Payment verified and appointment confirmed",
        data: {
          payment,
          appointment,
        },
      });
    } catch (error) {
      console.error("Razorpay verify error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Cancel a pending Razorpay payment attempt (PATIENT only)
router.post(
  "/razorpay/cancel",
  protect,
  authorizeRoles("patient"),
  async (req, res) => {
    try {
      const { paymentId } = req.body;
      if (!paymentId) return res.status(400).json({ message: "paymentId is required" });

      const payment = await Payment.findById(paymentId);
      if (!payment) return res.status(404).json({ message: "Payment not found" });

      if (String(payment.patient) !== String(req.user.id)) {
        return res.status(403).json({ message: "Not authorized to cancel this payment" });
      }

      if (payment.method !== "online" || payment.provider !== "razorpay") {
        return res.status(400).json({ message: "This payment is not a Razorpay online payment" });
      }

      if (payment.status !== "pending") {
        return res.status(400).json({ message: `Payment is already ${payment.status}` });
      }

      payment.status = "failed";
      payment.notes = "Payment attempt cancelled by user";
      await payment.save();

      const appointment = await Appointment.findById(payment.appointment);
      if (appointment && appointment.status !== "confirmed") {
        appointment.status = "cancelled";
        await appointment.save();
        await freeDoctorSlotIfNeeded(appointment.doctor, appointment.appointmentDate);
      }

      res.json({ success: true, message: "Payment cancelled" });
    } catch (error) {
      console.error("Razorpay cancel error:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Get patient profile (PATIENT only)
router.get("/profile", protect, authorizeRoles("patient"), async (req, res) => {
  try {
    const patient = await User.findById(req.user.id).select("-password");
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update patient profile and/or password (PATIENT only)
router.put("/profile", protect, authorizeRoles("patient"), async (req, res) => {
  try {
    const { name, phone, currentPassword, newPassword } = req.body;
    const patientId = req.user.id;

    // Find patient (includes password)
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    let profileChanged = false;
    let passwordChanged = false;

    // Update profile fields if provided
    if (name && name !== patient.name) {
      patient.name = name;
      profileChanged = true;
    }
    if (phone !== undefined && phone !== patient.phone) {
      patient.phone = phone;
      profileChanged = true;
    }

    // Handle optional password change
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: "Current password and new password are required" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "New password must be at least 6 characters long" });
      }

      if (currentPassword === newPassword) {
        return res
          .status(400)
          .json({ message: "New password must be different from current password" });
      }

      const isMatch = await bcrypt.compare(currentPassword, patient.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      patient.password = hashedPassword;
      passwordChanged = true;
    }

    // If nothing changed, just return current profile
    if (!profileChanged && !passwordChanged) {
      const existingPatient = await User.findById(patientId).select("-password");
      return res.json({
        success: true,
        message: "No changes detected",
        data: existingPatient,
      });
    }

    await patient.save();

    // Return updated patient without password
    const patientResponse = await User.findById(patientId).select("-password");

    res.json({
      success: true,
      message: passwordChanged
        ? profileChanged
          ? "Profile and password updated successfully"
          : "Password updated successfully"
        : "Profile updated successfully",
      data: patientResponse,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Change password (PATIENT only)
router.put("/change-password", protect, authorizeRoles("patient"), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    // Get the user with password (we need it to verify)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ 
      success: true, 
      message: "Password changed successfully" 
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

