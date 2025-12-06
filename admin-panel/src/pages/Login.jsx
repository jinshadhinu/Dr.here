import { useState } from "react";
import axios from "axios"; // simple axios import
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // Minimal login handler
  const loginHandler = async (e) => {
    e.preventDefault();
    setErrorMsg(""); // clear previous errors
    console.log("Login button clicked!", { email, password });

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      console.log("Backend response:", res.data);

      if (res.data.token && res.data.role) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        if (res.data.role === "admin") navigate("/admin/dashboard");
        else if (res.data.role === "hospital") navigate("/hospital/dashboard");
      } else {
        setErrorMsg(res.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err.response || err);
      setErrorMsg(err.response?.data?.message || "Server error / Invalid credentials");
    }
  };

  // Inline styles
  const styles = {
    container: {
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#e0eafc",
    },
    box: {
      padding: "30px",
      borderRadius: "10px",
      background: "#fff",
      width: "320px",
      textAlign: "center",
      boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
    },
    title: {
      fontSize: "28px",
      fontWeight: "bold",
      color: "#1f3c88",
      marginBottom: "5px",
    },
    subtitle: {
      color: "gray",
      marginBottom: "20px",
    },
    input: {
      width: "100%",
      padding: "10px",
      marginBottom: "10px",
      borderRadius: "5px",
      border: "1px solid lightgray",
      outline: "none",
    },
    button: {
      width: "100%",
      padding: "10px",
      background: "#1f3c88",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "bold",
    },
    errorMsg: {
      color: "red",
      marginBottom: "10px",
      fontSize: "14px",
    },
  };

  return (
    <div style={styles.container}>
      <form style={styles.box} onSubmit={loginHandler}>
        <h1 style={styles.title}>Dr.Here</h1>
        <p style={styles.subtitle}>Login</p>

        {errorMsg && <p style={styles.errorMsg}>{errorMsg}</p>}

        <input
          type="email"
          placeholder="Email"
          required
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
    </div>
  );
}
