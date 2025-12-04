// 👉 Change this URL to your backend API base URL
// Example (ask your backend friend what port they use):
// const API_BASE_URL = "http://localhost:5000/api";
const API_BASE_URL = "http://localhost:5000/api";

// Save token after login
function saveToken(token) {
  localStorage.setItem("hospitalToken", token);
}

// Get token for future requests
function getToken() {
  return localStorage.getItem("hospitalToken");
}

// Common headers with auth (we will use this later)
function getAuthHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}
