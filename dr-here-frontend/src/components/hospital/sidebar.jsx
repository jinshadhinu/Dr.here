import { useState, useEffect } from "react";
import "./sidebar.css";
import {
  FaHome,
  FaUserMd,
  FaCalendarCheck,
  FaUsers,
  FaStar,
  FaCog,
  FaBuilding
} from "react-icons/fa";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-title">
        {isOpen ? "Hospital Panel" : "HP"}
      </div>

      <ul className="sidebar-menu">
        <li><FaHome /> {isOpen && "Dashboard"}</li>
        <li><FaCalendarCheck /> {isOpen && "Appointments"}</li>
        <li><FaBuilding /> {isOpen && "Departments"}</li>
        <li><FaUserMd /> {isOpen && "Doctors"}</li>
      
        <li><FaUsers /> {isOpen && "Patients"}</li>
    
        <li><FaStar /> {isOpen && "Reviews"}</li>
        <li><FaCog /> {isOpen && "Settings"}</li>
      </ul>
    </div>
  );
}

export default Sidebar;
