import { useState, useEffect } from "react";
import "./PatientProfile.css";
import axios from "axios";

function PatientProfile() {
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "+91",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching patient profile with token:", token);
      
      const res = await axios.get("http://localhost:5000/api/patient/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("Patient profile response:", res.data);
      
      if (res.data.success) {
        setProfileData({
          name: res.data.data.name || "",
          email: res.data.data.email || "",
          phone: res.data.data.phone || "+91",
        });
      } else {
        console.error("Profile API returned error:", res.data);
        alert("Failed to load profile: " + (res.data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      alert("Failed to load profile data: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    // Ensure it starts with +91
    if (!value.startsWith('+91')) {
      value = '+91' + value.replace(/[^\d]/g, '');
    }
    // Limit to +91 followed by 10 digits
    if (value.length > 13) {
      value = value.slice(0, 13);
    }
    setProfileData({
      ...profileData,
      phone: value,
    });
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    if (profileData.phone && profileData.phone !== "+91") {
      const phoneRegex = /^\+91[6-9]\d{9}$/;
      if (!phoneRegex.test(profileData.phone)) {
        alert("Please enter a valid Indian mobile number (e.g., +919876543210)");
        return;
      }
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "http://localhost:5000/api/patient/profile",
        {
          phone: profileData.phone !== "+91" ? profileData.phone : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        alert(res.data.message || "Profile updated successfully!");
        setEditMode(false);
        // Update the profile data with the response
        setProfileData({
          ...profileData,
          name: res.data.data.name,
          phone: res.data.data.phone || "+91",
        });
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError("All fields are required");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirm password do not match");
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }

    setPasswordLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "http://localhost:5000/api/patient/profile",
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setPasswordSuccess(res.data.message || "Password changed successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to change password";
      setPasswordError(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    fetchProfile(); // Reset to original data
  };

  if (loading) {
    console.log("PatientProfile - Still loading, loading state:", loading);
    return (
      <div className="patient-profile">
        <p>Loading profile...</p>
      </div>
    );
  }

  console.log("PatientProfile - Not loading, profileData:", profileData);
  console.log("PatientProfile - Edit mode:", editMode);

  return (
    <div className="patient-profile">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your personal information, contact details, and password</p>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {profileData.name.charAt(0).toUpperCase()}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profileData.name}
              disabled
              className="disabled"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              disabled
              className="disabled"
              title="Email cannot be changed"
            />
            <small className="form-hint">Email address cannot be changed</small>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Mobile Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profileData.phone}
              onChange={handlePhoneChange}
              disabled={!editMode}
              className={editMode ? "editable" : "disabled"}
              placeholder="+91XXXXXXXXXX"
            />
            <small className="form-hint">Indian mobile number format (+91XXXXXXXXXX)</small>
          </div>

          <div className="form-actions">
            {!editMode ? (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="btn-edit"
              >
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button
                  type="submit"
                  disabled={updating}
                  className="btn-save"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={updating}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="profile-card password-card">
        <h2>Change Password</h2>
        <p className="password-subtitle">Update your account password</p>

        <form onSubmit={handlePasswordSubmit} className="password-form">
          {passwordError && <div className="error-message">{passwordError}</div>}
          {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}

          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Enter current password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password (min 6 characters)"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-save"
            disabled={passwordLoading}
          >
            {passwordLoading ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PatientProfile;
