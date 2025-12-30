import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./sidebar.css";
import {
  FaHome,
  FaUserMd,
  FaCalendarCheck,
  FaUsers,
  FaStar,
  FaCog,
  FaBuilding,
  FaKey
} from "react-icons/fa";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (e.clientX <= 70) {
        // Mouse inside collapsed sidebar zone
        setIsOpen(true);
      } else if (e.clientX > 230) {
        // Mouse left expanded sidebar zone
        setIsOpen(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-title">
        {isOpen ? "Hospital Panel" : "HP"}
      </div>

      <ul className="sidebar-menu">
        <li className={isActive("/hospital/dashboard") ? "active" : ""}>
          <Link to="/hospital/dashboard">
            <FaHome /> {isOpen && "Dashboard"}
          </Link>
        </li>
        <li className={isActive("/hospital/appointments") ? "active" : ""}>
          <Link to="/hospital/appointments">
            <FaCalendarCheck /> {isOpen && "Appointments"}
          </Link>
        </li>
        <li className={isActive("/hospital/departments") ? "active" : ""}>
          <Link to="/hospital/departments">
            <FaBuilding /> {isOpen && "Departments"}
          </Link>
        </li>
        <li className={isActive("/hospital/doctors") ? "active" : ""}>
          <Link to="/hospital/doctors">
            <FaUserMd /> {isOpen && "Doctors"}
          </Link>
        </li>
        <li className={isActive("/hospital/patients") ? "active" : ""}>
          <Link to="/hospital/patients">
            <FaUsers /> {isOpen && "Patients"}
          </Link>
        </li>
        <li className={isActive("/hospital/reviews") ? "active" : ""}>
          <Link to="/hospital/reviews">
            <FaStar /> {isOpen && "Reviews"}
          </Link>
        </li>
        <li className={isActive("/hospital/change-password") ? "active" : ""}>
          <Link to="/hospital/change-password">
            <FaKey /> {isOpen && "Change Password"}
          </Link>
        </li>
        <li className={isActive("/hospital/settings") ? "active" : ""}>
          <Link to="/hospital/settings">
            <FaCog /> {isOpen && "Settings"}
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
