import { useEffect, useState } from "react";
import axios from "axios";
import "./Doctors.css";

function Doctors() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    speciality: "",
    phone: "",
    email: "",
    status: "active",
  });

  const fetchDepartmentsWithDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        setLoading(false);
        return;
      }

      console.log("Fetching departments with doctors...");
      
      // Try the combined endpoint first
      try {
        const res = await axios.get("http://localhost:5000/api/hospital/doctors/departments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Departments response:", res.data);

        if (res.data.success && res.data.data) {
          setDepartments(res.data.data || []);
          console.log("Departments set:", res.data.data);
          return;
        }
      } catch (combinedErr) {
        console.warn("Combined endpoint failed, trying separate endpoints:", combinedErr.response?.status, combinedErr.message);
        
        // Fallback: fetch departments and doctors separately
        try {
          const [deptsRes, docsRes] = await Promise.all([
            axios.get("http://localhost:5000/api/hospital/departments", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:5000/api/hospital/doctors", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const depts = deptsRes.data.data || [];
          const docs = docsRes.data.data || [];

          console.log("Fetched departments:", depts.length);
          console.log("Fetched doctors:", docs.length);

          // Group doctors by department
          const departmentsWithDoctors = depts.map((dept) => {
            const deptDoctors = docs.filter(
              (doc) => doc.department && (doc.department._id === dept._id || doc.department.toString() === dept._id.toString())
            );
            return {
              ...dept,
              doctors: deptDoctors,
              doctorCount: deptDoctors.length,
            };
          });

          setDepartments(departmentsWithDoctors);
          console.log("Departments set (fallback):", departmentsWithDoctors);
        } catch (fallbackErr) {
          console.error("Fallback also failed:", fallbackErr);
          throw fallbackErr; // Re-throw to be caught by outer catch
        }
      }
    } catch (err) {
      console.error("Fetch departments error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      alert(err.response?.data?.message || "Failed to load departments. Please check if the backend server is running.");
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentsWithDoctors();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddDoctor = (departmentId) => {
    setSelectedDepartment(departmentId);
    setFormData({ name: "", speciality: "", phone: "", email: "", status: "active" });
    setShowAddForm(true);
    setEditingId(null);
  };

  const handleEditDoctor = (doctor) => {
    setEditingId(doctor._id);
    setSelectedDepartment(doctor.department?._id || doctor.department || "");
    setFormData({
      name: doctor.name || "",
      speciality: doctor.speciality || "",
      phone: doctor.phone || "",
      email: doctor.email || "",
      status: doctor.status || "active",
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing doctor
      if (!selectedDepartment) {
        alert("Please select a department");
        return;
      }
      
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `http://localhost:5000/api/hospital/doctors/${editingId}`,
          {
            ...formData,
            departmentId: selectedDepartment,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert("Doctor updated successfully");
        setFormData({ name: "", speciality: "", phone: "", email: "", status: "active" });
        setShowAddForm(false);
        setEditingId(null);
        setSelectedDepartment(null);
        fetchDepartmentsWithDoctors();
      } catch (err) {
        console.error("Update doctor error:", err);
        alert(err.response?.data?.message || "Failed to update doctor");
      }
    } else {
      // Add new doctor
      if (!selectedDepartment) return;

      try {
        const token = localStorage.getItem("token");
        await axios.post(
          "http://localhost:5000/api/hospital/doctors/add",
          {
            ...formData,
            departmentId: selectedDepartment,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert("Doctor added successfully");
        setFormData({ name: "", speciality: "", phone: "", email: "", status: "active" });
        setShowAddForm(false);
        setSelectedDepartment(null);
        fetchDepartmentsWithDoctors();
      } catch (err) {
        console.error("Add doctor error:", err);
        alert(err.response?.data?.message || "Failed to add doctor");
      }
    }
  };

  const handleDelete = async (doctorId) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/hospital/doctors/${doctorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Doctor deleted successfully");
      fetchDepartmentsWithDoctors();
    } catch (err) {
      console.error("Delete doctor error:", err);
      alert(err.response?.data?.message || "Failed to delete doctor");
    }
  };

  const cancelForm = () => {
    setFormData({ name: "", speciality: "", phone: "", email: "", status: "active" });
    setShowAddForm(false);
    setEditingId(null);
    setSelectedDepartment(null);
  };

  return (
    <div className="doctors-container">
      <div className="doctors-header">
        <div>
          <h1>Doctors</h1>
          <p>Manage doctors by department</p>
        </div>
      </div>

      {(showAddForm || editingId) && (
        <div className="doctor-form-card">
          <h2>{editingId ? "Edit Doctor" : "Add New Doctor"}</h2>
          <form onSubmit={handleSubmit} className="doctor-form">
            {editingId && (
              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <select
                  id="department"
                  name="department"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">Doctor Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter doctor name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="speciality">Speciality</label>
              <input
                type="text"
                id="speciality"
                name="speciality"
                value={formData.speciality}
                onChange={handleInputChange}
                placeholder="e.g., Cardiologist, Neurologist"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
              />
            </div>

            {editingId && (
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-save">
                {editingId ? "Update Doctor" : "Add Doctor"}
              </button>
              <button type="button" className="btn-cancel" onClick={cancelForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading departments...</div>
      ) : departments.length === 0 ? (
        <div className="empty-state">
          <p>No departments found. Please create departments first.</p>
          <p style={{ marginTop: "10px", fontSize: "14px", color: "#999" }}>
            Go to <strong>Departments</strong> page to add departments.
          </p>
        </div>
      ) : (
        <div className="departments-list">
          {departments.map((dept) => (
            <div key={dept._id} className="department-section">
              <div className="department-header">
                <div>
                  <h3>{dept.name}</h3>
                  {dept.description && <p className="dept-description">{dept.description}</p>}
                </div>
                <button
                  className="btn-add-doctor"
                  onClick={() => handleAddDoctor(dept._id)}
                >
                  + Add Doctor
                </button>
              </div>

              {dept.doctors && dept.doctors.length > 0 ? (
                <div className="doctors-grid">
                  {dept.doctors.map((doctor) => (
                    <div key={doctor._id} className="doctor-card">
                      <div className="doctor-info">
                        <h4>{doctor.name}</h4>
                        {doctor.speciality && (
                          <p className="doctor-speciality">{doctor.speciality}</p>
                        )}
                        {doctor.phone && <p className="doctor-detail">📞 {doctor.phone}</p>}
                        {doctor.email && <p className="doctor-detail">✉️ {doctor.email}</p>}
                        <span className={`status-badge ${doctor.status}`}>
                          {doctor.status}
                        </span>
                      </div>
                      <div className="doctor-actions">
                        <button
                          className="btn-edit-small"
                          onClick={() => handleEditDoctor(doctor)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete-small"
                          onClick={() => handleDelete(doctor._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-doctors">
                  <p>No doctors in this department yet. Click "Add Doctor" to add one.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Doctors;

