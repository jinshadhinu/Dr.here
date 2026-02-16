import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./AdminSidebar.css";
import { FaHome, FaBuilding, FaPlus } from "react-icons/fa";

function AdminSidebar() {
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
        <li className={isActive("/admin/dashboard") ? "active" : ""}>
          <Link to="/admin/dashboard">
            <FaHome /> {isOpen && "Dashboard"}
          </Link>
        </li>
        <li className={isActive("/admin/hospitals") ? "active" : ""}>
          <Link to="/admin/hospitals">
            <FaBuilding /> {isOpen && "Hospitals"}
          </Link>
        </li>
        <li className={isActive("/admin/add-hospital") ? "active" : ""}>
          <Link to="/admin/add-hospital">
            <FaPlus /> {isOpen && "Add Hospital"}
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default AdminSidebar;