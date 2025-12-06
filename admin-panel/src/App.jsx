import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const loginHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      if (res.data.role === "admin") {
        navigate("/admin/dashboard");
      } else if (res.data.role === "hospital") {
        navigate("/hospital/dashboard");
      }
    } catch (err) {
      alert("Invalid Credentials");
    }
  };

  // Styles
  const styles = {
    container: {
      height: "100vh",
      width: "100%",
      background: "linear-gradient(to right, #e0eafc, #cfdef3)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    box: {
      width: "360px",
      background: "#fff",
      padding: "30px",
      borderRadius: "10px",
      textAlign: "center",
      boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
    },
    brandTitle: {
      fontSize: "28px",
      fontWeight: "bold",
      color: "#1f3c88",
      marginBottom: "5px",
    },
    loginTitle: {
      fontSize: "16px",
      color: "gray",
      marginBottom: "20px",
    },
    input: {
      width: "100%",
      padding: "12px",
      marginBottom: "12px",
      borderRadius: "6px",
      border: "1px solid lightgray",
      outline: "none",
    },
    button: {
      width: "100%",
      padding: "12px",
      background: "#1f3c88",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.container}>
      <form style={styles.box} onSubmit={loginHandler}>
        {/* Heading */}
        <h1 style={styles.brandTitle}>Dr.Here</h1>
        <p style={styles.loginTitle}>Login</p>

        {/* Inputs */}
        <input
          type="email"
          placeholder="Email"
          required
          style={styles.input}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          required
          style={styles.input}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Submit */}
        <button style={styles.button} type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

