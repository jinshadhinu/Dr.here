const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { 
    type: String, 
    required: false,
    validate: {
      validator: function(v) {
        // Allow empty string or valid Indian mobile number (10 digits after +91)
        return !v || /^\+91[6-9]\d{9}$/.test(v);
      },
      message: props => 'Phone number must be a valid Indian mobile number in format +91XXXXXXXXXX'
    }
  },
  role: {
    type: String,
    enum: ["admin", "hospital", "doctor", "patient"],
    default: "patient",
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
