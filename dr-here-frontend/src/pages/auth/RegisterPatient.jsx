import { useState } from "react";
import "./RegisterPatient.css";
import bg from "../../assets/bg.jpg";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function RegisterPatient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "+91",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    // Ensure it starts with +91
    if (!value.startsWith('+91')) {
      value = '+91' + value.replace(/[^\d]/g, '');
    }
    // Limit to +91 followed by 10 digits
    if (value.length > 13) {
      value = value.slice(0, 13);
    }
    setFormData({
      ...formData,
      phone: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("REGISTER BUTTON CLICKED");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    // Validate phone number
    if (formData.phone && formData.phone !== "+91") {
      const phoneRegex = /^\+91[6-9]\d{9}$/;
      if (!phoneRegex.test(formData.phone)) {
        alert("Please enter a valid Indian mobile number (e.g., +919876543210)");
        return;
      }
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone !== "+91" ? formData.phone : undefined,
          role: "patient", // Explicitly set role as patient
        }
      );

      console.log("REGISTRATION SUCCESS:", res.data);

      // Save auth data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", "patient");

      alert("Account created successfully!");
      navigate("/patient/dashboard");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      console.error("Registration error:", err.response?.data);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="glass-login-background"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="glass-card">
        <h3 className="glass-title">Dr.Here</h3>
        <p className="glass-sub">Create Patient Account</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="glass-input"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="glass-input"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="phone"
            placeholder="Mobile Number (+91XXXXXXXXXX)"
            className="glass-input"
            value={formData.phone}
            onChange={handlePhoneChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="glass-input"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="glass-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
          />

          <button type="submit" className="glass-button" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="glass-footer-links">
          <p className="glass-footer-text">Already have an account?</p>
          <Link to="/login-patient" className="glass-link">
            Login as Patient
          </Link>
        </div>

        <p className="glass-footer">© 2025 Dr.Here Portal</p>
      </div>
    </div>
  );
}

export default RegisterPatient;


















