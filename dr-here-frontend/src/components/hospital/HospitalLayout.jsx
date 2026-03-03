import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import "./HospitalLayout.css";

function HospitalLayout() {
  return (
    <div className="hospital-layout">
      <Sidebar />

      <div className="hospital-main">
        <Navbar />
        <div className="hospital-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default HospitalLayout;









































