import { useEffect, useState } from "react";
import axios from "../api/axios";

const Dashboard = () => {
    if (localStorage.getItem("role") !== "admin") {
  window.location.href = "/";
}
  const [stats, setStats] = useState({
    users: 0,
    hospitals: 0,
    appointments: 0,
  });

  useEffect(() => {
    axios.get("/api/admin/stats")
      .then(res => setStats(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>

      <div style={{ display: "flex", gap: "20px" }}>
        <div>Users: {stats.users}</div>
        <div>Hospitals: {stats.hospitals}</div>
        <div>Appointments: {stats.appointments}</div>
      </div>
    </div>
  );
};

export default Dashboard;
