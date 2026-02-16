const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true }, // date + time of slot
    isBooked: { type: Boolean, default: false }, // whether slot already booked
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    speciality: { type: String },
    phone: { type: String },
    email: { type: String },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: false,
    },
    createdBy: {
      // the hospital admin / user who added the doctor
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    slots: [slotSchema], // list of available slots (date/time)
    // Optional working days for the doctor (e.g. ["monday","tuesday"])
    workingDays: {
      type: [String],
      default: [],
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
