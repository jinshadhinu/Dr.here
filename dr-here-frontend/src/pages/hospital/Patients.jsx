import { useState, useEffect } from "react";
import "./Patients.css";
import axios from "axios";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // First, let's check the debug endpoint
      console.log("Fetching debug data...");
      const debugRes = await axios.get("http://localhost:5000/api/hospital/debug", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Debug data:", debugRes.data);
      
      // Now fetch patients
      const res = await axios.get("http://localhost:5000/api/hospital/patients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Patients data:", res.data);
      
      if (res.data.success) {
        setPatients(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch patients:", err);
      alert("Failed to load patients: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateJoined = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "confirmed":
        return "status-confirmed";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-unknown";
    }
  };

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.phone && patient.phone.includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="patients-page">
        <p>Loading patients...</p>
      </div>
    );
  }

  return (
    <div className="patients-page">
      <div className="patients-header">
        <div>
          <h1>Patients</h1>
          <p>Manage all patients who have appointments with your hospital</p>
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search patients by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="no-patients">
          <p>{searchTerm ? "No patients found matching your search." : "No patients found."}</p>
        </div>
      ) : (
        <div className="patients-table-wrapper">
          <table className="patients-table">
            <thead>
              <tr>
                <th>Patient Info</th>
                <th>Contact</th>
                <th>Appointments</th>
                <th>Last Appointment</th>
                <th>Date Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient._id}>
                  <td>
                    <div className="patient-info">
                      <div className="patient-avatar">
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong>{patient.name}</strong>
                        <div className="patient-id">ID: {patient._id.slice(-8)}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div className="email">{patient.email}</div>
                      {patient.phone && <div className="phone">{patient.phone}</div>}
                    </div>
                  </td>
                  <td>
                    <div className="appointment-stats">
                      <span className="appointment-count">{patient.appointmentCount}</span>
                      <span className="appointment-label">Total Appointments</span>
                    </div>
                  </td>
                  <td>
                    {patient.lastAppointmentDate ? (
                      <div>
                        <div className="last-appointment-date">
                          {formatDate(patient.lastAppointmentDate)}
                        </div>
                        {patient.lastAppointmentStatus && (
                          <span className={`status-badge ${getStatusBadgeClass(patient.lastAppointmentStatus)}`}>
                            {patient.lastAppointmentStatus}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="no-appointments">No appointments yet</span>
                    )}
                  </td>
                  <td>
                    <div className="date-joined">
                      {formatDateJoined(patient.createdAt)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Patients;