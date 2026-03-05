import { useState, useEffect } from "react";
import "./BookAppointment.css";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function BookAppointment() {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [onlinePaymentId, setOnlinePaymentId] = useState(null);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/patient/hospitals`);
      if (res.data.success) {
        setHospitals(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch hospitals:", err);
      alert("Failed to load hospitals");
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
      setOnlinePaymentId(null);
      
      // Fetch departments for selected hospital
      const deptRes = await axios.get(
        `${API_BASE_URL}/patient/hospitals/${hospitalId}/departments`
      );
      if (deptRes.data.success) {
        setDepartments(deptRes.data.data || []);
      }

      // Fetch all doctors for hospital
      const docRes = await axios.get(
        `${API_BASE_URL}/patient/hospitals/${hospitalId}/doctors`
      );
      if (docRes.data.success) {
        setDoctors(docRes.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch hospital data:", err);
      alert("Failed to load hospital information");
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
      setOnlinePaymentId(null);

      const res = await axios.get(
        `${API_BASE_URL}/patient/hospitals/${selectedHospital}/departments/${departmentId}/doctors`
      );
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
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setAdvanceAmount("");
      setOnlinePaymentId(null);

      // Fetch available slots for doctor
      const res = await axios.get(
        `${API_BASE_URL}/doctors/${doctorId}/slots`
      );
      if (res.data.success) {
        setAvailableSlots(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch slots:", err);
      alert("Failed to load available slots");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedHospital(null);
    setSelectedDepartment(null);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setAdvanceAmount("");
    setAvailableSlots([]);
    setDepartments([]);
    setDoctors([]);
    setPaymentMethod("online");
    setOnlinePaymentId(null);
  };

  const openRazorpayCheckout = async ({ keyId, order, paymentId }) => {
    const scriptOk = await loadRazorpayScript();
    if (!scriptOk) {
      alert("Failed to load Razorpay checkout. Please check your internet connection.");
      return;
    }

    const options = {
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name: "Dr.Here",
      description: "Advance payment for appointment booking",
      order_id: order.id,
      handler: async (response) => {
        try {
          const token = localStorage.getItem("token");
          const verifyRes = await axios.post(
            `${API_BASE_URL}/patient/razorpay/verify`,
            {
              paymentId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (verifyRes.data.success) {
            alert("Payment successful! Appointment booked and confirmed.");
            resetForm();
            fetchHospitals();
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        } catch (err) {
          console.error("Verify payment error:", err);
          alert(err.response?.data?.message || "Payment verification failed.");
        } finally {
          setOnlinePaymentId(null);
        }
      },
      modal: {
        ondismiss: async () => {
          try {
            const token = localStorage.getItem("token");
            await axios.post(
              `${API_BASE_URL}/patient/razorpay/cancel`,
              { paymentId },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
          } catch (err) {
            console.error("Cancel payment error:", err);
          } finally {
            setOnlinePaymentId(null);
            alert("Payment cancelled. Slot has been released.");
          }
        },
      },
      theme: {
        color: "#0ea5e9",
      },
    };

    const rz = new window.Razorpay(options);
    rz.on("payment.failed", async () => {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `${API_BASE_URL}/patient/razorpay/cancel`,
          { paymentId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (err) {
        console.error("Payment failed cancel error:", err);
      } finally {
        setOnlinePaymentId(null);
        alert("Payment failed. Please try again.");
      }
    });

    rz.open();
  };

  const handleOnlineBooking = async () => {
    if (!selectedDoctor || !selectedTimeSlot) {
      alert("Please select a doctor, date, and time slot");
      return;
    }

    const numericAdvance = Number(advanceAmount);
    if (!advanceAmount || Number.isNaN(numericAdvance) || numericAdvance < 100) {
      alert("Advance payment of at least 100 is required.");
      return;
    }

    try {
      setBooking(true);
      const token = localStorage.getItem("token");

      const createRes = await axios.post(
        `${API_BASE_URL}/patient/razorpay/create-order`,
        {
          doctorId: selectedDoctor,
          slotDate: selectedTimeSlot.date,
          advanceAmount: numericAdvance,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!createRes.data.success) {
        alert(createRes.data.message || "Failed to start online payment");
        return;
      }

      const { keyId, order, paymentId } = createRes.data.data;
      setOnlinePaymentId(paymentId);
      await openRazorpayCheckout({ keyId, order, paymentId });
    } catch (err) {
      console.error("Online booking error:", err);
      alert(err.response?.data?.message || "Failed to start Razorpay payment");
    } finally {
      setBooking(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedTimeSlot) {
      alert("Please select a doctor, date, and time slot");
      return;
    }

    const numericAdvance = Number(advanceAmount);
    if (!advanceAmount || Number.isNaN(numericAdvance) || numericAdvance < 100) {
      alert("Advance payment of at least 100 is required.");
      return;
    }

    try {
      setBooking(true);
      if (paymentMethod === "online") {
        await handleOnlineBooking();
        return;
      }

      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/patient/book-appointment`,
        {
          doctorId: selectedDoctor,
          slotDate: selectedTimeSlot.date,
          advanceAmount: numericAdvance,
          paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        alert("Appointment booked successfully with advance payment!");
        resetForm();
        fetchHospitals();
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setBooking(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="book-appointment">
      <h1>Book Appointment</h1>
      <p>Select a hospital, department, doctor, and time slot to book your appointment.</p>

      {loading && <div className="loading">Loading...</div>}

      {/* Step 1: Select Hospital */}
      <div className="booking-step">
        <h2>Step 1: Select Hospital</h2>
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
      {selectedHospital && doctors.length > 0 && (
        <div className="booking-step">
          <h2>Step 3: Select Doctor</h2>
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
        </div>
      )}

      {/* Step 4: Select Date */}
      {selectedDoctor && availableSlots.length > 0 && (
        <div className="booking-step">
          <h2>Step 4: Select Date</h2>
          <div className="dates-grid">
            {[...new Set(availableSlots.map(slot => formatDate(slot.date)))].map((dateStr, idx) => (
              <button
                key={idx}
                className={`date-btn ${selectedDate === dateStr ? "selected" : ""}`}
                onClick={() => {
                  setSelectedDate(dateStr);
                  setSelectedTimeSlot(null);
                }}
              >
                {dateStr}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Select Time */}
      {selectedDoctor && selectedDate && (
        <div className="booking-step">
          <h2>Step 5: Select Time</h2>
          <div className="times-grid">
            {availableSlots
              .filter(slot => formatDate(slot.date) === selectedDate)
              .map((slot, idx) => (
                <button
                  key={idx}
                  className={`time-btn ${selectedTimeSlot?.date === slot.date ? "selected" : ""}`}
                  onClick={() => setSelectedTimeSlot(slot)}
                >
                  {formatTime(slot.date)}
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
      {selectedTimeSlot && (
        <div className="booking-actions">
          <div className="payment-section">
            <h3>Advance Payment (Required)</h3>
            <p className="payment-note">
              Pay an advance (min 100) to confirm your slot. Online payments are processed securely via Razorpay.
            </p>

            <div className="payment-fields">
              <div className="field">
                <label htmlFor="advanceAmount">Advance Amount (min 100)</label>
                <input
                  id="advanceAmount"
                  type="number"
                  min="100"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                  placeholder="Enter amount"
                  disabled={booking}
                />
              </div>
            </div>

            <div className="payment-methods" role="group" aria-label="Payment method">
              <button
                type="button"
                className={`payment-method-card razorpay ${paymentMethod === "online" ? "active" : ""}`}
                onClick={() => setPaymentMethod("online")}
                disabled={booking}
              >
                <div className="title">Online (Razorpay)</div>
                <div className="subtitle">Instant confirmation</div>
              </button>
              <button
                type="button"
                className={`payment-method-card ${paymentMethod === "cash" ? "active" : ""}`}
                onClick={() => setPaymentMethod("cash")}
                disabled={booking}
              >
                <div className="title">Cash at Hospital</div>
                <div className="subtitle">Marked as pending</div>
              </button>
            </div>

            {paymentMethod === "online" ? (
              <div className="razorpay-panel">
                <div className="rz-row">
                  <div className="rz-badge">Razorpay</div>
                  <div className="rz-text">
                    <div className="rz-strong">Secure online payment</div>
                    <div className="rz-muted">Your appointment is confirmed after successful payment.</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="cash-panel">
                Cash advance will be collected at the hospital reception. Your payment status will remain pending until collected.
              </div>
            )}
          </div>
          <button
            className="book-btn"
            onClick={handleBookAppointment}
            disabled={booking || (paymentMethod === "online" && !!onlinePaymentId)}
          >
            {booking
              ? "Processing..."
              : paymentMethod === "online"
                ? "Pay & Book Appointment"
                : "Book Appointment"}
          </button>
        </div>
      )}
    </div>
  );
}

export default BookAppointment;


















