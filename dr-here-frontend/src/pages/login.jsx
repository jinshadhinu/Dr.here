import "./login.css";
import bg from "../assets/bg.jpg";

function Login() {
  return (
    <div className="login-container" style={{ backgroundImage: `url(${bg})`, display: window.location.pathname === "/login" ? "flex" : "none" }}>
      <div className="login-card">
        <h2 className="title">Welcome Back</h2>
        <p className="sub">Login to your account</p>

        <form>
          <input type="email" placeholder="Email" className="input-box" />
          <input type="password" placeholder="Password" className="input-box" />

          <button className="login-btn">Login</button>
        </form>

        <p className="footer-text">© 2025 Dr.Here — Hospital Management System</p>
      </div>
    </div>
  );
}

export default Login;
