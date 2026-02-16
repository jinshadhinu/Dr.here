import { useState, useEffect } from "react";
import "./Appointments.css";
import axios from "axios";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, confirmed, completed, cancelled

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/hospital/appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.success) {
        setAppointments(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      alert("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/hospital/appointments/${appointmentId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchAppointments();
    } catch (err) {
      console.error("Failed to update appointment:", err);
      alert("Failed to update appointment status");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === "all") return true;
    return apt.status === filter;
  });

  if (loading) {
    return (
      <div className="appointments-page">
        <p>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="appointments-page">
      <div className="appointments-header">
        <div>
          <h1>Appointments</h1>
          <p>Manage all patient appointments</p>
        </div>
        <div className="filter-buttons">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={filter === "pending" ? "active" : ""}
            onClick={() => setFilter("pending")}
          >
            Pending
          </button>
          <button
            className={filter === "confirmed" ? "active" : ""}
            onClick={() => setFilter("confirmed")}
          >
            Confirmed
          </button>
          <button
            className={filter === "completed" ? "active" : ""}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
          <button
            className={filter === "cancelled" ? "active" : ""}
            onClick={() => setFilter("cancelled")}
          >
            Cancelled
          </button>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="no-appointments">
          <p>No appointments found.</p>
        </div>
      ) : (
        <div className="appointments-table-wrapper">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>
                    <div className="patient-info">
                      <strong>{appointment.patient?.name || "N/A"}</strong>
                      {appointment.patient?.email && (
                        <span className="email">{appointment.patient.email}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div>
                      <strong>{appointment.doctor?.name || "N/A"}</strong>
                      {appointment.doctor?.speciality && (
                        <span className="speciality">
                          {appointment.doctor.speciality}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{formatDate(appointment.appointmentDate)}</td>
                  <td>
                    <span className={`status-pill status-${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {appointment.status === "pending" && (
                        <>
                          <button
                            className="btn-confirm"
                            onClick={() => handleStatusChange(appointment._id, "confirmed")}
                          >
                            Confirm
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={() => handleStatusChange(appointment._id, "cancelled")}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {appointment.status === "confirmed" && (
                        <button
                          className="btn-complete"
                          onClick={() => handleStatusChange(appointment._id, "completed")}
                        >
                          Complete
                        </button>
                      )}
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

export default Appointments;










