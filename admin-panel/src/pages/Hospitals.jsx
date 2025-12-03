// src/pages/Hospitals.jsx
import { useEffect, useState } from "react";
import api from "../api/axios";

function Hospitals() {
  const [hospitals, setHospitals] = useState([]);

  // ✅ 1. GET all hospitals from backend
  const getHospitals = async () => {
    try {
      const res = await api.get("/admin/hospitals", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setHospitals(res.data);
    } catch (err) {
      alert("Error loading hospitals");
    }
  };

  // ✅ Load hospitals when page opens
  useEffect(() => {
    getHospitals();
  }, []);

  // ✅ 2. APPROVE hospital function
  const approveHospital = async (id) => {
    try {
      await api.put(
        `/admin/hospital/approve/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Hospital approved");
      getHospitals(); // reload list
    } catch (err) {
      alert("Approval failed");
    }
  };

  return (
    <div>
      <h2>Hospitals</h2>

      {hospitals.length === 0 ? (
        <p>No hospitals found</p>
      ) : (
        hospitals.map((h) => (
          <div
            key={h._id}
            style={{
              border: "1px solid black",
              margin: "10px",
              padding: "10px",
            }}
          >
            <p><b>Name:</b> {h.name}</p>
            <p><b>Email:</b> {h.email}</p>
            <p><b>Status:</b> {h.isApproved ? "Approved" : "Pending"}</p>

            {!h.isApproved && (
              <button onClick={() => approveHospital(h._id)}>
                Approve
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Hospitals;
