import { useState, useEffect } from "react";
import "./PatientNavbar.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function PatientNavbar() {
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState("Patient");

  useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.data && res.data.name) {
          setPatientName(res.data.name);
        }
      } catch (err) {
        console.error("Failed to fetch patient profile:", err);
      }
    };

    fetchPatientProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login-patient");
  };

  return (
    <nav className="top-navbar">
      <div className="nav-left">
        <h1 className="nav-title">Dr.Here</h1>
      </div>

      <div className="nav-right">
        <span className="patient-name">{patientName}</span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default PatientNavbar;


















