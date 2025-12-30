import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const fetchHospitals = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/hospitals", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setHospitals(res.data.data || []);
    } catch (err) {
      console.error("Fetch hospitals error:", err);
      alert("Failed to load hospitals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleStatusChange = async (id, action) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/admin/hospitals/${action}/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchHospitals();
    } catch (err) {
      console.error(`${action} hospital error:`, err);
      alert("Action failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hospital?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/hospitals/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchHospitals();
    } catch (err) {
      console.error("Delete hospital error:", err);
      alert("Failed to delete hospital");
    }
  };

  const startEdit = (hospital) => {
    setEditingId(hospital._id);
    setEditForm({
      name: hospital.name || "",
      email: hospital.email || "",
      phone: hospital.phone || "",
      address: hospital.address || "",
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/hospitals/${editingId}`,
        editForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEditingId(null);
      fetchHospitals();
    } catch (err) {
      console.error("Update hospital error:", err);
      alert("Failed to update hospital");
    }
  };

  const filteredHospitals = hospitals.filter((h) => {
    const term = search.toLowerCase();
    const matchesText =
      h.name?.toLowerCase().includes(term) ||
      h.email?.toLowerCase().includes(term);
    const matchesStatus =
      statusFilter === "all" ? true : h.status === statusFilter;
    return matchesText && matchesStatus;
  });

  return (
    <div className="dashboard-layout">
      <div className="dashboard-content">
        <h1>Hospitals</h1>
        <p>Manage all hospitals in the system.</p>

        <div className="filter-bar">
          <input
            className="filter-input"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : filteredHospitals.length === 0 ? (
          <p>No hospitals found.</p>
        ) : (
          <div className="hospital-table-wrapper">
            <table className="hospital-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHospitals.map((h) => (
                  <tr key={h._id}>
                    <td>{h.name}</td>
                    <td>{h.email}</td>
                    <td className={`status-pill ${h.status}`}>
                      {h.status}
                    </td>
                    <td>
                      {h.createdAt
                        ? new Date(h.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      <button
                        className="btn-approve"
                        onClick={() => handleStatusChange(h._id, "approve")}
                        disabled={h.status === "approved"}
                      >
                        Approve
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleStatusChange(h._id, "reject")}
                        disabled={h.status === "rejected"}
                      >
                        Reject
                      </button>
                      <button
                        className="btn-edit"
                        onClick={() => startEdit(h)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(h._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {editingId && (
          <div className="hospital-form-card">
            <h2>Edit Hospital</h2>
            <form onSubmit={handleEditSubmit} className="hospital-form">
              <div className="form-row">
                <label>Hospital Name</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-row">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-row">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-row">
                <label>Address</label>
                <textarea
                  name="address"
                  value={editForm.address}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div>
                <button type="submit" className="btn-approve">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn-reject"
                  onClick={() => setEditingId(null)}
                  style={{ marginLeft: "8px" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Hospitals;
