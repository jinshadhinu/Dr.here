import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const Appointments = () => {
    if (localStorage.getItem("role") !== "hospital") {
  window.location.href = "/";
}
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    axios
      .get("/hospital/appointments")
      .then((res) => setAppointments(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div>
      <h2>Appointments</h2>

      {appointments.length === 0 ? (
        <p>No appointments</p>
      ) : (
        <ul>
          {appointments.map((a) => (
            <li key={a._id}>
              Patient: {a.patientName} — Doctor: {a.doctorName} — Date:{" "}
              {a.date}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Appointments;
