import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const HospitalDashboard = () => {
    if (localStorage.getItem("role") !== "hospital") {
  window.location.href = "/";
}
  const [stats, setStats] = useState({
    doctors: 0,
    appointments: 0,
    patients: 0,
  });

  useEffect(() => {
    axios
      .get("/hospital/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div>
      <h2>Hospital Dashboard</h2>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div>Doctors: {stats.doctors}</div>
        <div>Appointments: {stats.appointments}</div>
        <div>Patients: {stats.patients}</div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
