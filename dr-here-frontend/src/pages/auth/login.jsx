import { useState } from "react";
import "./login.css";
import bg from "../../assets/bg.jpg";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("LOGIN BUTTON CLICKED");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      console.log("LOGIN SUCCESS:", res.data);

      // ✅ SAVE AUTH DATA (CRITICAL)
      localStorage.setItem("token", res.data.token);

      // normalize role
      const role = res.data.role.toLowerCase();
      localStorage.setItem("role", role);

      // ✅ ROLE-BASED REDIRECT
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "hospital") {
        navigate("/hospital/dashboard");
      } else {
        alert("Unknown role");
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Invalid credentials";
      console.error("Login error details:", {
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
        <p className="glass-sub">Hospital Admin Login</p>

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

        <div className="login-links">
          <p>Are you a patient?</p>
          <button 
            type="button" 
            className="link-button"
            onClick={() => navigate('/login-patient')}
          >
            Patient Login
          </button>
        </div>

        <p className="glass-footer">© 2025 Dr.Here Portal</p>
      </div>
    </div>
  );
}

export default Login;

