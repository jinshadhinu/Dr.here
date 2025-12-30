import "../hospital/navbar.css";
import { useNavigate } from "react-router-dom";

function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <nav className="top-navbar">
      <div className="nav-left">
        <h1 className="nav-title">Dr.Here</h1>
      </div>

      <div className="nav-right">
        <span className="hospital-name">Admin Panel</span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default AdminNavbar;
