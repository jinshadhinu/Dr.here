import { useState, useEffect } from "react";
import "./navbar.css";
import { useNavigate } from "react-router-dom";
import { logoutHospital } from "../../utils/hospital";
import axios from "axios";

function Navbar() {
  const navigate = useNavigate();
  const [hospitalName, setHospitalName] = useState("Hospital");

  useEffect(() => {
    const fetchHospitalProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/hospital/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.data.success && res.data.data) {
          setHospitalName(res.data.data.name || "Hospital");
        }
      } catch (err) {
        console.error("Failed to fetch hospital profile:", err);
      }
    };

    fetchHospitalProfile();
  }, []);

  const handleLogout = () => {
    logoutHospital();
    navigate("/login");
  };

  return (
    <nav className="top-navbar">
      <div className="nav-left">
        <h1 className="nav-title">Dr.Here</h1>
      </div>

      <div className="nav-right">
        <span className="hospital-name">{hospitalName}</span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
