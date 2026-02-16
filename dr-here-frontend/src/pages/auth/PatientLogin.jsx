import { useState } from "react";
import "./PatientLogin.css";
import bg from "../../assets/bg.jpg";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function PatientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("PATIENT LOGIN BUTTON CLICKED");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      console.log("PATIENT LOGIN SUCCESS:", res.data);

      // ✅ SAVE AUTH DATA
      localStorage.setItem("token", res.data.token);

      // normalize role
      const role = res.data.role.toLowerCase();
      localStorage.setItem("role", role);

      // ✅ ROLE-BASED REDIRECT
      if (role === "patient") {
        navigate("/patient/dashboard");
      } else {
        alert("This login is for patients only. Please use the admin/hospital login.");
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Invalid credentials";
      console.error("Patient login error details:", {
        status: err.response?.status,
        message: errorMessage,
        data: err.response?.data
      });
      alert(errorMessage);
    }
  };

  return (
    <div
      className="glass-login-background"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="glass-card">
        <h3 className="glass-title">Dr.Here</h3>
        <p className="glass-sub">Patient Login</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="glass-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="glass-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="glass-button">
            Login
          </button>
        </form>

        <div className="glass-footer-links">
          <p className="glass-footer-text">New patient?</p>
          <Link to="/register-patient" className="glass-link">
            Create Account
          </Link>
        </div>

        <div className="glass-footer-links">
          <Link to="/login" className="glass-link-secondary">
            Continue as Admin / Hospital
          </Link>
        </div>

        <p className="glass-footer">© 2025 Dr.Here Portal</p>
      </div>
    </div>
  );
}

export default PatientLogin;

