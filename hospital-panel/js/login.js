// Select form and error message elements
const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

// Listen for form submit
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // stop page from reloading

  // Get values from input fields
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // Hide any old error
  errorMsg.style.display = "none";
  errorMsg.textContent = "";

  try {
    // Call backend API for hospital login
    const response = await fetch(`${API_BASE_URL}/hospital/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    // If response is not ok (status code not 200-299)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      errorMsg.textContent = errorData.message || "Invalid email or password";
      errorMsg.style.display = "block";
      return;
    }

    // If login success
    const data = await response.json();
    // Expecting something like: { token: "...", hospital: { ... } }

    // Save token for future pages
    saveToken(data.token);

    // (Optional) save hospital info
    if (data.hospital) {
      localStorage.setItem("hospitalInfo", JSON.stringify(data.hospital));
    }

    // Redirect to dashboard page (we will create this later)
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Login error:", error);
    errorMsg.textContent = "Something went wrong. Please try again.";
    errorMsg.style.display = "block";
  }
});
