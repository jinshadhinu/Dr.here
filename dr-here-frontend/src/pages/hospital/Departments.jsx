import { useEffect, useState } from "react";
import axios from "axios";
import "./Departments.css";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
  });

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/hospital/departments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDepartments(res.data.data || []);
    } catch (err) {
      console.error("Fetch departments error:", err);
      alert("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    
    // Validate name
    if (!formData.name || formData.name.trim() === "") {
      alert("Department name is required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/hospital/departments/add",
        {
          name: formData.name.trim(),
          description: formData.description?.trim() || "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        alert("Department added successfully");
        setFormData({ name: "", description: "", status: "active" });
        setShowAddForm(false);
        fetchDepartments();
      }
    } catch (err) {
      console.error("Add department error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to add department";
      console.error("Error details:", err.response?.data);
      alert(errorMessage);
    }
  };

  const handleEdit = (department) => {
    setEditingId(department._id);
    setFormData({
      name: department.name || "",
      description: department.description || "",
      status: department.status || "active",
    });
    setShowAddForm(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/hospital/departments/${editingId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Department updated successfully");
      setFormData({ name: "", description: "", status: "active" });
      setEditingId(null);
      fetchDepartments();
    } catch (err) {
      console.error("Update department error:", err);
      alert(err.response?.data?.message || "Failed to update department");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/hospital/departments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Department deleted successfully");
      fetchDepartments();
    } catch (err) {
      console.error("Delete department error:", err);
      alert(err.response?.data?.message || "Failed to delete department");
    }
  };

  const cancelForm = () => {
    setFormData({ name: "", description: "", status: "active" });
    setShowAddForm(false);
    setEditingId(null);
  };

  return (
    <div className="departments-container">
      <div className="departments-header">
        <div>
          <h1>Departments</h1>
          <p>Manage your hospital departments (e.g., Neurology, Gastroenterology, Cardiology)</p>
        </div>
        <button
          className="btn-add"
          onClick={() => {
            setShowAddForm(true);
            setEditingId(null);
            setFormData({ name: "", description: "", status: "active" });
          }}
        >
          + Add Department
        </button>
      </div>

      {(showAddForm || editingId) && (
        <div className="department-form-card">
          <h2>{editingId ? "Edit Department" : "Add New Department"}</h2>
          <form onSubmit={editingId ? handleUpdate : handleAdd} className="department-form">
            <div className="form-group">
              <label htmlFor="name">Department Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Neurology, Gastroenterology"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the department"
                rows="3"
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
                {editingId ? "Update Department" : "Add Department"}
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
          <p>No departments found. Click "Add Department" to create one.</p>
        </div>
      ) : (
        <div className="departments-grid">
          {departments.map((dept) => (
            <div key={dept._id} className="department-card">
              <div className="department-header">
                <h3>{dept.name}</h3>
                <span className={`status-badge ${dept.status}`}>
                  {dept.status}
                </span>
              </div>
              {dept.description && (
                <p className="department-description">{dept.description}</p>
              )}
              <div className="department-actions">
                <button
                  className="btn-edit-small"
                  onClick={() => handleEdit(dept)}
                >
                  Edit
                </button>
                <button
                  className="btn-delete-small"
                  onClick={() => handleDelete(dept._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Departments;

