import { useState, useEffect } from "react";
import "./PatientAppointments.css";
import axios from "axios";

function PatientAppointments() {
  const [activeTab, setActiveTab] = useState("appointments"); // "appointments" or "book"
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, pending, confirmed, completed, cancelled

  // Booking states
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (activeTab === "appointments") {
      fetchAppointments();
    } else if (activeTab === "book") {
      fetchHospitals();
    }
  }, [activeTab]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/patient/appointments", {
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

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/patient/hospitals");
      console.log("Hospitals response:", res.data);
      if (res.data.success) {
        const hospitalsList = res.data.data || [];
        setHospitals(hospitalsList);
        if (hospitalsList.length === 0) {
          console.warn("No hospitals found");
        }
      } else {
        console.error("Failed to fetch hospitals: Invalid response", res.data);
        alert("Failed to load hospitals: " + (res.data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Failed to fetch hospitals:", err);
      alert("Failed to load hospitals: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalSelect = async (hospitalId) => {
    try {
      setLoading(true);
      setSelectedHospital(hospitalId);
      setSelectedDepartment(null);
      setSelectedDoctor(null);
      setAvailableSlots([]);
      
      // Fetch departments for selected hospital
      try {
        const deptRes = await axios.get(
          `http://localhost:5000/api/patient/hospitals/${hospitalId}/departments`
        );
        if (deptRes.data.success) {
          setDepartments(deptRes.data.data || []);
          console.log("Departments loaded:", deptRes.data.data?.length || 0);
        }
      } catch (deptErr) {
        console.warn("Failed to fetch departments:", deptErr);
        setDepartments([]);
      }

      // Fetch all doctors for hospital
      const docRes = await axios.get(
        `http://localhost:5000/api/patient/hospitals/${hospitalId}/doctors`
      );
      if (docRes.data.success) {
        const doctorsList = docRes.data.data || [];
        setDoctors(doctorsList);
        console.log("Doctors loaded:", doctorsList.length);
        if (doctorsList.length === 0) {
          alert("No doctors available for this hospital.");
        }
      } else {
        console.error("Failed to fetch doctors: Invalid response", docRes.data);
        alert("Failed to load doctors: " + (docRes.data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Failed to fetch hospital data:", err);
      alert("Failed to load hospital information: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentSelect = async (departmentId) => {
    try {
      setLoading(true);
      setSelectedDepartment(departmentId);
      setSelectedDoctor(null);
      setAvailableSlots([]);

      // If no department selected, fetch all doctors from hospital
      // Otherwise, fetch doctors from specific department
      const url = departmentId
        ? `http://localhost:5000/api/patient/hospitals/${selectedHospital}/departments/${departmentId}/doctors`
        : `http://localhost:5000/api/patient/hospitals/${selectedHospital}/doctors`;
      
      const res = await axios.get(url);
      if (res.data.success) {
        setDoctors(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch department doctors:", err);
      alert("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = async (doctorId) => {
    try {
      setLoading(true);
      setSelectedDoctor(doctorId);
      setSelectedSlot(null);

      // Fetch available slots for doctor
      const res = await axios.get(
        `http://localhost:5000/api/doctors/${doctorId}/slots`
      );
      if (res.data.success) {
        const slots = res.data.data || [];
        setAvailableSlots(slots);
        console.log("Available slots loaded:", slots.length);
        if (slots.length === 0) {
          alert("No available time slots for this doctor. Please select another doctor.");
        }
      } else {
        console.error("Failed to fetch slots: Invalid response", res.data);
        alert("Failed to load available slots: " + (res.data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Failed to fetch slots:", err);
      alert("Failed to load available slots: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedSlot) {
      alert("Please select a doctor and time slot");
      return;
    }

    try {
      setBooking(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in. Please login again.");
        return;
      }

      console.log("Booking appointment:", {
        doctorId: selectedDoctor,
        slotDate: selectedSlot.date
      });

      const res = await axios.post(
        "http://localhost:5000/api/patient/book-appointment",
        {
          doctorId: selectedDoctor,
          slotDate: selectedSlot.date,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Booking response:", res.data);

      if (res.data.success) {
        alert("Appointment booked successfully!");
        // Reset form
        setSelectedHospital(null);
        setSelectedDepartment(null);
        setSelectedDoctor(null);
        setSelectedSlot(null);
        setAvailableSlots([]);
        setDepartments([]);
        setDoctors([]);
        // Switch to appointments tab and refresh
        setActiveTab("appointments");
        fetchAppointments();
      } else {
        alert("Failed to book appointment: " + (res.data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Booking error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to book appointment";
      alert("Error: " + errorMessage);
    } finally {
      setBooking(false);
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

  return (
    <div className="patient-appointments-page">
      <div className="tabs-header">
        <button
          className={`tab-button ${activeTab === "appointments" ? "active" : ""}`}
          onClick={() => setActiveTab("appointments")}
        >
          My Appointments
        </button>
        <button
          className={`tab-button ${activeTab === "book" ? "active" : ""}`}
          onClick={() => setActiveTab("book")}
        >
          Book New Appointment
        </button>
      </div>

      {activeTab === "appointments" && (
        <div className="appointments-section">
          <div className="appointments-header">
            <div>
              <h1>My Appointments</h1>
              <p>View and manage your appointments</p>
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

          {loading ? (
            <div className="loading">Loading appointments...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="no-appointments">
              <p>No appointments found.</p>
            </div>
          ) : (
            <div className="appointments-table-wrapper">
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Hospital</th>
                    <th>Doctor</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td>
                        <div className="hospital-info">
                          <strong>{appointment.hospital?.name || "N/A"}</strong>
                          {appointment.hospital?.address && (
                            <span className="address">{appointment.hospital.address}</span>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "book" && (
        <div className="book-section">
          <h1>Book Appointment</h1>
          <p>Select a hospital, department, doctor, and time slot to book your appointment.</p>

          {loading && <div className="loading">Loading...</div>}

          {/* Step 1: Select Hospital */}
          <div className="booking-step">
            <h2>Step 1: Select Hospital</h2>
            {hospitals.length === 0 && !loading ? (
              <div className="no-hospitals">
                <p>No hospitals available. Please contact the administrator.</p>
              </div>
            ) : (
              <div className="hospitals-grid">
                {hospitals.map((hospital) => (
                  <div
                    key={hospital._id}
                    className={`hospital-card ${
                      selectedHospital === hospital._id ? "selected" : ""
                    }`}
                    onClick={() => handleHospitalSelect(hospital._id)}
                  >
                    <h3>{hospital.name}</h3>
                    {hospital.address && <p className="address">{hospital.address}</p>}
                    {hospital.phone && <p className="phone">{hospital.phone}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Select Department (if departments exist) */}
          {selectedHospital && departments.length > 0 && (
            <div className="booking-step">
              <h2>Step 2: Select Department (Optional)</h2>
              <div className="departments-list">
                <button
                  className={`department-btn ${
                    selectedDepartment === null ? "selected" : ""
                  }`}
                  onClick={() => handleDepartmentSelect(null)}
                >
                  All Departments
                </button>
                {departments.map((dept) => (
                  <button
                    key={dept._id}
                    className={`department-btn ${
                      selectedDepartment === dept._id ? "selected" : ""
                    }`}
                    onClick={() => handleDepartmentSelect(dept._id)}
                  >
                    {dept.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select Doctor */}
          {selectedHospital && (
            <div className="booking-step">
              <h2>Step 3: Select Doctor</h2>
              {doctors.length === 0 && !loading ? (
                <div className="no-doctors">
                  <p>No doctors available for this hospital. Please select another hospital.</p>
                </div>
              ) : (
                <div className="doctors-grid">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor._id}
                      className={`doctor-card ${
                        selectedDoctor === doctor._id ? "selected" : ""
                      }`}
                      onClick={() => handleDoctorSelect(doctor._id)}
                    >
                      <h3>{doctor.name}</h3>
                      {doctor.speciality && (
                        <p className="speciality">{doctor.speciality}</p>
                      )}
                      {doctor.department && doctor.department.name && (
                        <p className="department">{doctor.department.name}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Select Time Slot */}
          {selectedDoctor && availableSlots.length > 0 && (
            <div className="booking-step">
              <h2>Step 4: Select Time Slot</h2>
              <div className="slots-grid">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    className={`slot-btn ${
                      selectedSlot?.date === slot.date ? "selected" : ""
                    }`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {formatDate(slot.date)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedDoctor && availableSlots.length === 0 && (
            <div className="no-slots">
              <p>No available slots for this doctor. Please select another doctor.</p>
            </div>
          )}

          {/* Book Button */}
          {selectedSlot && (
            <div className="booking-actions">
              <button
                className="book-btn"
                onClick={handleBookAppointment}
                disabled={booking}
              >
                {booking ? "Booking..." : "Book Appointment"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PatientAppointments;

