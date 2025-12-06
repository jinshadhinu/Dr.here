import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const Doctors = () => {
    if (localStorage.getItem("role") !== "hospital") {
  window.location.href = "/";
}
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    axios
      .get("/hospital/doctors")
      .then((res) => setDoctors(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div>
      <h2>Doctors</h2>

      {doctors.length === 0 ? (
        <p>No doctors found</p>
      ) : (
        <ul>
          {doctors.map((doc) => (
            <li key={doc._id}>
              {doc.name} — {doc.specialization}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Doctors;
