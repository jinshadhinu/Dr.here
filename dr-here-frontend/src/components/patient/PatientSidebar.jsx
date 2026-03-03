import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./PatientSidebar.css";
import {
  FaHome,
  FaCalendarPlus,
  FaCalendarCheck,
  FaUser,
  FaCog,
  FaKey
} from "react-icons/fa";

function PatientSidebar() {
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
      <ul className="sidebar-menu">
        <li className={isActive("/patient/dashboard") ? "active" : ""}>
          <Link to="/patient/dashboard">
            <FaHome /> {isOpen && "Dashboard"}
          </Link>
        </li>
        <li className={isActive("/patient/book-appointment") ? "active" : ""}>
          <Link to="/patient/book-appointment">
            <FaCalendarPlus /> {isOpen && "Book Appointment"}
          </Link>
        </li>
        <li className={isActive("/patient/appointments") ? "active" : ""}>
          <Link to="/patient/appointments">
            <FaCalendarCheck /> {isOpen && "My Appointments"}
          </Link>
        </li>
        <li className={isActive("/patient/profile") ? "active" : ""}>
          <Link to="/patient/profile">
            <FaUser /> {isOpen && "My Profile"}
          </Link>
        </li>
        <li className={isActive("/patient/change-password") ? "active" : ""}>
          <Link to="/patient/change-password">
            <FaKey /> {isOpen && "Change Password"}
          </Link>
        </li>
        <li className={isActive("/patient/settings") ? "active" : ""}>
          <Link to="/patient/settings">
            <FaCog /> {isOpen && "Settings"}
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default PatientSidebar;


















