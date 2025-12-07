import "./login.css";
import bg from "../assets/bg.jpg";
import axios from "axios";
import { useState } from "react";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("LOGIN BUTTON CLICKED");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password
      });

      console.log("LOGIN SUCCESS:", res.data);

      // Redirect based on role
      if (res.data.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else if (res.data.role === "hospital") {
        window.location.href = "/hospital/dashboard";
      }

    } catch (error) {
      console.log("LOGIN FAILED:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      className="login-container"
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >
      <div className="login-card">
        <h2 className="title">Welcome Back</h2>
        <p className="sub">Login to your account</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="input-box"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="input-box"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="login-btn" type="submit">
            Login
          </button>
        </form>

        <p className="footer-text">© 2025 Dr.Here — Hospital Management System</p>
      </div>
    </div>
  );
}

export default Login;
