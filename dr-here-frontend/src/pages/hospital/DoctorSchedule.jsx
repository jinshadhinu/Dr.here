import { useEffect, useState } from "react";
import axios from "axios";
import "./DoctorSchedule.css";

const DAYS = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
];

function DoctorSchedule() {
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [workingDays, setWorkingDays] = useState([]);

  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [slotDate, setSlotDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [slotDuration, setSlotDuration] = useState(2); // default 2 minutes
  const [savingWorkingDays, setSavingWorkingDays] = useState(false);
  const [addingSlot, setAddingSlot] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        setLoadingDoctors(false);
        return;
      }

      // Use hospital doctors endpoint so hospital sees only its own doctors
      const res = await axios.get("http://localhost:5000/api/hospital/doctors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success && Array.isArray(res.data.data)) {
        setDoctors(res.data.data);
      } else {
        setDoctors([]);
      }
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
      alert(err.response?.data?.message || "Failed to load doctors");
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleSelectDoctor = async (doctorId) => {
    setSelectedDoctorId(doctorId);
    const doctor = doctors.find((d) => d._id === doctorId) || null;
    setSelectedDoctor(doctor);

    const days = (doctor?.workingDays || []).map((d) => String(d).toLowerCase());
    setWorkingDays(days);

    if (doctorId) {
      await fetchSlotsForDoctor(doctorId);
    } else {
      setSlots([]);
    }
  };

  const fetchSlotsForDoctor = async (doctorId) => {
    try {
      setLoadingSlots(true);
      const res = await axios.get(`http://localhost:5000/api/doctors/${doctorId}/slots`);
      if (res.data.success && Array.isArray(res.data.data)) {
        setSlots(res.data.data);
      } else {
        setSlots([]);
      }
    } catch (err) {
      console.error("Failed to fetch slots:", err);
      alert(err.response?.data?.message || "Failed to load slots");
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const toggleWorkingDay = (dayKey) => {
    setWorkingDays((prev) =>
      prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]
    );
  };

  const handleSaveWorkingDays = async () => {
    if (!selectedDoctorId) return;

    try {
      setSavingWorkingDays(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in");
        return;
      }

      const res = await axios.put(
        `http://localhost:5000/api/doctors/${selectedDoctorId}`,
        { workingDays },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        alert("Working days updated successfully");
        // refresh doctors list so state is in sync
        fetchDoctors();
      } else {
        alert(res.data.message || "Failed to update working days");
      }
    } catch (err) {
      console.error("Failed to save working days:", err);
      alert(err.response?.data?.message || "Failed to save working days");
    } finally {
      setSavingWorkingDays(false);
    }
  };

  const handleGenerateSlots = async () => {
    if (!selectedDoctorId) {
      alert("Select a doctor first");
      return;
    }
    if (!slotDate || !startTime || !endTime || !slotDuration) {
      alert("Please fill all fields");
      return;
    }

    // Parse times
    const start = new Date(`${slotDate}T${startTime}:00`);
    const end = new Date(`${slotDate}T${endTime}:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      alert("Invalid start/end time");
      return;
    }

    // Generate slots
    const slotsToAdd = [];
    let current = new Date(start);
    while (current < end) {
      slotsToAdd.push(new Date(current));
      current = new Date(current.getTime() + slotDuration * 60000);
    }
    if (slotsToAdd.length === 0) {
      alert("No slots generated. Check your times and duration.");
      return;
    }

    try {
      setAddingSlot(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not logged in");
        return;
      }

      const res = await axios.post(
        `http://localhost:5000/api/doctors/${selectedDoctorId}/slots/bulk`,
        { slots: slotsToAdd.map((d) => d.toISOString()) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        alert("Slots generated successfully");
        setSlotDate("");
        setStartTime("");
        setEndTime("");
        setSlotDuration(2);
        fetchSlotsForDoctor(selectedDoctorId);
      } else {
        alert(res.data.message || "Failed to generate slots");
      }
    } catch (err) {
      console.error("Failed to generate slots:", err);
      alert(err.response?.data?.message || "Failed to generate slots");
    } finally {
      setAddingSlot(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="doctor-schedule-page">
      <div className="doctor-schedule-header">
        <div>
          <h1>Doctor Schedules</h1>
          <p>Choose doctors, set their working days, and open appointment slots.</p>
        </div>
      </div>

      <div className="doctor-schedule-layout">
        <div className="doctor-list-panel">
          <h2>Doctors</h2>
          {loadingDoctors ? (
            <div className="loading">Loading doctors...</div>
          ) : doctors.length === 0 ? (
            <div className="empty-state">
              <p>No doctors found. Please add doctors first.</p>
            </div>
          ) : (
            <ul className="doctor-list">
              {doctors.map((doc) => (
                <li
                  key={doc._id}
                  className={`doctor-list-item ${
                    selectedDoctorId === doc._id ? "selected" : ""
                  }`}
                  onClick={() => handleSelectDoctor(doc._id)}
                >
                  <div className="doctor-name">{doc.name}</div>
                  {doc.speciality && (
                    <div className="doctor-speciality">{doc.speciality}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="doctor-config-panel">
          {!selectedDoctor ? (
            <div className="empty-state">
              <p>Select a doctor from the left to configure schedule.</p>
            </div>
          ) : (
            <>
              <div className="doctor-summary-card">
                <h2>{selectedDoctor.name}</h2>
                <p className="summary-line">
                  {selectedDoctor.speciality || "No speciality specified"}
                </p>
                {selectedDoctor.department && selectedDoctor.department.name && (
                  <p className="summary-line dept">
                    Department: {selectedDoctor.department.name}
                  </p>
                )}
              </div>

              <div className="config-section">
                <h3>Working Days</h3>
                <p className="section-subtitle">
                  Select the days this doctor is generally available.
                </p>
                <div className="days-grid">
                  {DAYS.map((day) => (
                    <button
                      key={day.key}
                      type="button"
                      className={`day-pill ${
                        workingDays.includes(day.key) ? "active" : ""
                      }`}
                      onClick={() => toggleWorkingDay(day.key)}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveWorkingDays}
                  disabled={savingWorkingDays}
                >
                  {savingWorkingDays ? "Saving..." : "Save Working Days"}
                </button>
              </div>

              <div className="config-section">
                <h3>Open Appointment Slots</h3>
                <p className="section-subtitle">
                  Generate slots by selecting a date, start time, end time, and slot duration (minutes).
                </p>
                <div className="slot-form">
                  <div className="slot-input">
                    <label>Date</label>
                    <input
                      type="date"
                      value={slotDate}
                      onChange={(e) => setSlotDate(e.target.value)}
                    />
                  </div>
                  <div className="slot-input">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="slot-input">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                  <div className="slot-input">
                    <label>Slot Duration (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      value={slotDuration}
                      onChange={(e) => setSlotDuration(Number(e.target.value))}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleGenerateSlots}
                    disabled={addingSlot}
                  >
                    {addingSlot ? "Generating..." : "Generate Slots"}
                  </button>
                </div>

                <div className="slots-list-section">
                  {loadingSlots ? (
                    <div className="loading">Loading slots...</div>
                  ) : slots.length === 0 ? (
                    <div className="empty-state small">
                      <p>No open slots yet. Generate slots above.</p>
                    </div>
                  ) : (
                    <ul className="slots-list">
                      {slots.map((slot, index) => (
                        <li key={index} className="slot-item">
                          {formatDateTime(slot.date)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorSchedule;

















