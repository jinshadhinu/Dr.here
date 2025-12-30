import { useState, useEffect } from "react";
import "./HospitalDashboard.css";
import Sidebar from "../../components/hospital/sidebar.jsx";
import Navbar from "../../components/hospital/navbar.jsx";
import StatCard from "../../components/hospital/StatCard.jsx";
import axios from "axios";

function HospitalDashboard() {
  const [statistics, setStatistics] = useState({
    todaysAppointments: 0,
    totalDoctors: 0,
    totalPatients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/hospital/statistics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.data.success && res.data.data) {
          setStatistics({
            todaysAppointments: res.data.data.todaysAppointments || 0,
            totalDoctors: res.data.data.totalDoctors || 0,
            totalPatients: res.data.data.totalPatients || 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch statistics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-content">
        <Navbar />

        {loading ? (
          <div className="stats-container">
            <p>Loading statistics...</p>
          </div>
        ) : (
          <div className="stats-container">
            <StatCard 
              title="Today's Appointments" 
              value={statistics.todaysAppointments.toString()} 
            />
            <StatCard 
              title="Total Doctors" 
              value={statistics.totalDoctors.toString()} 
            />
            <StatCard 
              title="Total Patients" 
              value={statistics.totalPatients.toString()} 
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default HospitalDashboard;


