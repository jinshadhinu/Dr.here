const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      enum: ["cash", "card", "online", "other"],
      default: "cash",
    },
    type: {
      type: String,
      enum: ["advance", "full"],
      default: "advance",
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "success",
    },
    notes: {
      type: String,
      default: "",
    },

    // Online payment provider metadata (optional)
    provider: {
      type: String,
      enum: ["razorpay", "other"],
      default: "other",
    },
    currency: {
      type: String,
      default: "INR",
    },
    razorpayOrderId: {
      type: String,
      default: "",
    },
    razorpayPaymentId: {
      type: String,
      default: "",
    },
    razorpaySignature: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);

