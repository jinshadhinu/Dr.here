import { useState, useEffect } from "react";
import "./PatientDashboard.css";
import StatCard from "../../components/hospital/StatCard.jsx";
import axios from "axios";

function PatientDashboard() {
  const [statistics, setStatistics] = useState({
    upcomingAppointments: 0,
    totalAppointments: 0,
    completedAppointments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("");
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          setLoading(false);
          return;
        }

        // For now, we'll use placeholder data
        // You can create an API endpoint later: /api/patient/statistics
        // const res = await axios.get("http://localhost:5000/api/patient/statistics", {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //   },
        // });

        // Placeholder data - replace with actual API call
        setStatistics({
          upcomingAppointments: 0,
          totalAppointments: 0,
          completedAppointments: 0,
        });
      } catch (err) {
        console.error("Failed to fetch statistics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const handleLocationSearch = async () => {
    if (!location.trim()) {
      alert("Please enter a location (city, area, or pincode)");
      return;
    }

    try {
      setSearching(true);
      const token = localStorage.getItem("token");
      console.log("Searching for hospitals with location:", location);
      
      // For demo purposes, we'll simulate finding nearby hospitals
      // In a real app, you'd use Google Maps API or similar
      const res = await axios.get("http://localhost:5000/api/hospitals", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Hospitals API response:", res.data);

      if (res.data.success) {
        // Filter hospitals based on location (simple text search for demo)
        const filtered = res.data.data.filter(hospital => 
          hospital.name.toLowerCase().includes(location.toLowerCase()) ||
          hospital.address?.toLowerCase().includes(location.toLowerCase()) ||
          hospital.city?.toLowerCase().includes(location.toLowerCase())
        );
        console.log("Filtered hospitals:", filtered);
        setNearbyHospitals(filtered);
      } else {
        console.error("API returned error:", res.data);
        alert("Failed to fetch hospitals: " + (res.data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Failed to find hospitals:", err);
      alert("Failed to search hospitals. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="patient-dashboard">
      <h1> User Dashboard</h1>
      <p>Welcome! Manage your appointments and health records.</p>

      {/* Nearby Hospitals Search */}
      <div className="nearby-hospitals-section">
        <h2>Find Nearby Hospitals</h2>
        <div className="search-location">
          <input
            type="text"
            placeholder="Enter your location (city, area, or pincode)..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="location-input"
          />
          <button
            onClick={handleLocationSearch}
            disabled={searching}
            className="search-button"
          >
            {searching ? "Searching..." : "Find Hospitals"}
          </button>
        </div>

        {nearbyHospitals.length > 0 && (
          <div className="hospitals-list">
            <h3>Found {nearbyHospitals.length} Hospitals Near You</h3>
            <div className="hospitals-grid">
              {nearbyHospitals.map((hospital) => (
                <div key={hospital._id} className="hospital-card">
                  <h4>{hospital.name}</h4>
                  {hospital.address && <p className="hospital-address">{hospital.address}</p>}
                  {hospital.city && <p className="hospital-city">{hospital.city}</p>}
                  {hospital.phone && <p className="hospital-phone">{hospital.phone}</p>}
                  <button 
                    className="book-appointment-btn"
                    onClick={() => window.location.href = `/login-patient?hospital=${hospital._id}`}
                  >
                    Book Appointment
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Statistics Section */}
      {loading ? (
        <div className="stats-container">
          <p>Loading statistics...</p>
        </div>
      ) : (
        <div className="stats-container">
          <StatCard 
            title="Upcoming Appointments" 
            value={statistics.upcomingAppointments.toString()}
          />
          <StatCard 
            title="Total Appointments" 
            value={statistics.totalAppointments.toString()}
          />
          <StatCard 
            title="Completed Appointments" 
            value={statistics.completedAppointments.toString()}
          />
        </div>
      )}
    </div>
  );
}

export default PatientDashboard;

