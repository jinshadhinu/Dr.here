import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AddHospital() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/hospitals/add", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Hospital added successfully");
      navigate("/admin/hospitals");
    } catch (err) {
      console.error("Add hospital error:", err);
      alert(err.response?.data?.message || "Failed to add hospital");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content">
        <h1>Add Hospital</h1>
        <p>Create a new hospital record.</p>

        <div className="hospital-form-card">
          <form onSubmit={handleSubmit} className="hospital-form">
            <div className="form-row">
              <label>Hospital Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <label>Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <label>Temporary Password (for hospital login)</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn-approve" disabled={loading}>
              {loading ? "Saving..." : "Save Hospital"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddHospital;
