import { useState } from "react";
import "./login.css";
import bg from "../../assets/bg.jpg";
import axios from "axios";

const handleLogin = () => {
  const hospitalData = {
    id: "hosp_001",
    name: "City Hospital",
    doctorsCount: 12,
    patientsCount: 320,
    appointmentsToday: 45
  };

localStorage.setItem("token", res.data.token);
localStorage.setItem("hospital", JSON.stringify(res.data.hospital));

  navigate("/hospital/dashboard");
};


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("LOGIN BUTTON CLICKED");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      console.log("LOGIN SUCCESS:", res.data);

      if (res.data.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/hospital/dashboard";
      }
    } catch (err) {
      alert(err.response?.data?.message || "Invalid credentials");
      console.log(err);
    }
  };

  return (
    <div
      className="glass-login-background"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="glass-card">
        <h3 className="glass-title">Dr.Here</h3>
        <p className="glass-sub">Admin Login</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="glass-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="glass-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="glass-button">
            Login
          </button>
        </form>

        <p className="glass-footer">© 2025 Dr.Here Admin Portal</p>
      </div>
    </div>
  );
}

export default Login;

