import { useState, useEffect } from "react";
import "./AdminSidebar.css";
import { useNavigate } from "react-router-dom";
import { FaHome, FaBuilding, FaPlus } from "react-icons/fa";

function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (e.clientX <= 70) {
        setIsOpen(true);
      } else if (e.clientX > 230) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <ul className="sidebar-menu">
        <li onClick={() => navigate("/admin/dashboard")}>
          <FaHome />
          {isOpen && <span className="label">Dashboard</span>}
        </li>
        <li onClick={() => navigate("/admin/hospitals")}>
          <FaBuilding />
          {isOpen && <span className="label">Hospitals</span>}
        </li>
        <li onClick={() => navigate("/admin/add-hospital")}>
          <FaPlus />
          {isOpen && <span className="label">Add Hospital</span>}
        </li>
      </ul>
    </div>
  );
}

export default AdminSidebar;