import { useState, useEffect } from "react";
import "./PatientDashboard.css";
import StatCard from "../../components/hospital/StatCard.jsx";
import axios from "axios";

function PatientDashboard() {
  const [statistics, setStatistics] = useState({
    upcomingAppointments: 0,
    totalAppointments: 0,
    completedAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          setLoading(false);
          return;
        }

        // For now, we'll use placeholder data
        // You can create an API endpoint later: /api/patient/statistics
        // const res = await axios.get("http://localhost:5000/api/patient/statistics", {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //   },
        // });

        // Placeholder data - replace with actual API call
        setStatistics({
          upcomingAppointments: 0,
          totalAppointments: 0,
          completedAppointments: 0,
        });
      } catch (err) {
        console.error("Failed to fetch statistics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  return (
    <div className="patient-dashboard">
      <h1>Patient Dashboard</h1>
      <p>Welcome! Manage your appointments and health records.</p>

      {loading ? (
        <div className="stats-container">
          <p>Loading statistics...</p>
        </div>
      ) : (
        <div className="stats-container">
          <StatCard 
            title="Upcoming Appointments" 
            value={statistics.upcomingAppointments.toString()}
          />
          <StatCard 
            title="Total Appointments" 
            value={statistics.totalAppointments.toString()}
          />
          <StatCard 
            title="Completed Appointments" 
            value={statistics.completedAppointments.toString()}
          />
        </div>
      )}
    </div>
  );
}

export default PatientDashboard;

