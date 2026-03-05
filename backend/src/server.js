const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const adminRoutes = require("./routes/adminRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const adminHospitalRoutes = require("./routes/adminHospitalRoutes");
const hospitalProfileRoutes = require("./routes/hospitalProfileRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const hospitalDoctorRoutes = require("./routes/hospitalDoctorRoutes");
const patientRoutes = require("./routes/patientRoutes");

// Always load .env from the backend root, regardless of where Node is started
dotenv.config({
  path: path.join(__dirname, "..", ".env"),
});
console.log("Loaded Razorpay config:", {
  hasKeyId: !!process.env.RAZORPAY_KEY_ID,
  hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
});
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", adminRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/admin", adminHospitalRoutes);
app.use("/api/hospital", hospitalProfileRoutes);
app.use("/api/hospital/departments", departmentRoutes);
app.use("/api/hospital/doctors", hospitalDoctorRoutes);
app.use("/api/patient", patientRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
