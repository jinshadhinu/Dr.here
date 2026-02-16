import { Outlet } from "react-router-dom";
import PatientSidebar from "./PatientSidebar";
import PatientNavbar from "./PatientNavbar";
import "./PatientLayout.css";

function PatientLayout() {
  return (
    <div className="patient-layout">
      <PatientSidebar />

      <div className="patient-main">
        <PatientNavbar />
        <div className="patient-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default PatientLayout;










