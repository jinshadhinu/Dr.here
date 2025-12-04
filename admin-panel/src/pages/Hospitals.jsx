import { useEffect, useState } from "react";
import axios from "../api/axios";

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);

  const fetchHospitals = async () => {
    const res = await axios.get("/api/admin/hospitals");
    setHospitals(res.data);
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const approveHospital = async (id) => {
    await axios.put(`/api/admin/hospitals/approve/${id}`);
    fetchHospitals();
  };

  const rejectHospital = async (id) => {
    await axios.put(`/api/admin/hospitals/reject/${id}`);
    fetchHospitals();
  };

  return (
    <div>
      <h2>Hospitals</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {hospitals.map(h => (
            <tr key={h._id}>
              <td>{h.name}</td>
              <td>{h.email}</td>
              <td>{h.status}</td>
              <td>
                <button onClick={() => approveHospital(h._id)}>Approve</button>
                <button onClick={() => rejectHospital(h._id)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
};

export default Hospitals;
