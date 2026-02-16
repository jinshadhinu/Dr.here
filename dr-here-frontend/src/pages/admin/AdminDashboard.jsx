import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import StatCard from "../../components/hospital/StatCard.jsx";
import axios from "axios";

function AdminDashboard() {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState({
    totalHospitals: 0,
    activeHospitals: 0,
    pendingHospitals: 0,
    totalDoctors: 0,
    totalPatients: 0,
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

        console.log("Fetching admin statistics...");
        const res = await axios.get("http://localhost:5000/api/admin/statistics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Statistics response:", res.data);

        if (res.data.success && res.data.data) {
          setStatistics({
            totalHospitals: res.data.data.totalHospitals ?? 0,
            activeHospitals: res.data.data.activeHospitals ?? 0,
            pendingHospitals: res.data.data.pendingHospitals ?? 0,
            totalDoctors: res.data.data.totalDoctors ?? 0,
            totalPatients: res.data.data.totalPatients ?? 0,
          });
          console.log("Statistics set:", {
            totalHospitals: res.data.data.totalHospitals,
            activeHospitals: res.data.data.activeHospitals,
            pendingHospitals: res.data.data.pendingHospitals,
            totalDoctors: res.data.data.totalDoctors,
            totalPatients: res.data.data.totalPatients,
          });
        } else {
          console.error("Invalid response format:", res.data);
        }
      } catch (err) {
        console.error("Failed to fetch statistics:", err);
        console.error("Error response:", err.response?.data);
        console.error("Error status:", err.response?.status);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content">
        <h1>Admin Dashboard</h1>
        <p>Manage hospitals and monitor the system overview.</p>

        {loading ? (
          <div className="stats-container">
            <p>Loading statistics...</p>
          </div>
        ) : (
          <div className="stats-container">
            <StatCard 
              title="Total Hospitals" 
              value={statistics.totalHospitals.toString()}
              onClick={() => navigate("/admin/hospitals")}
            />
            <StatCard 
              title="Active Hospitals" 
              value={statistics.activeHospitals.toString()}
              onClick={() => navigate("/admin/hospitals")}
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

export default AdminDashboard;
