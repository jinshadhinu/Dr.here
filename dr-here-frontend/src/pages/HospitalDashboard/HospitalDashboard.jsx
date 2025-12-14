import "./HospitalDashboard.css"; // if you keep css there; else adjust path
import Sidebar from "../../components/hospital/sidebar.jsx";
import Navbar from "../../components/hospital/navbar.jsx";
import StatCard from "../../components/hospital/StatCard.jsx";

function HospitalDashboard() {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-content">
        <Navbar />

       <div className="stats-container">
  <StatCard title="Total Doctors" value="12" />
  <StatCard title="Today's Appointments" value="45" />
  <StatCard title="Total Patients" value="320" />
  <StatCard title="Active Patients" value="89" />
</div>
      </div>
    </div>
  );
}

export default HospitalDashboard;


