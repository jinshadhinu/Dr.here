import { Link, useLocation, useNavigate } from "react-router-dom";

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Hospitals", path: "/hospitals" },
    { name: "Users", path: "/users" },
    { name: "Settings", path: "/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/"); // redirect to login
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <nav style={{
        width: "220px",
        padding: "20px",
        borderRight: "1px solid #ddd",
        background: "#f8f9fa",
      }}>
        <h2 style={{ marginBottom: "30px" }}>Admin Panel</h2>

        <ul style={{ listStyle: "none", padding: 0 }}>
          {menuItems.map((item) => (
            <li key={item.path} style={{ marginBottom: "15px" }}>
              <Link
                to={item.path}
                style={{
                  textDecoration: "none",
                  padding: "10px 15px",
                  display: "block",
                  borderRadius: "5px",
                  backgroundColor: location.pathname === item.path ? "#007bff" : "transparent",
                  color: location.pathname === item.path ? "#fff" : "#333",
                  fontWeight: location.pathname === item.path ? "bold" : "normal",
                }}
              >
                {item.name}
              </Link>
            </li>
          ))}

          {/* Logout Button */}
          <li style={{ marginTop: "30px" }}>
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "10px 15px",
                borderRadius: "5px",
                border: "none",
                backgroundColor: "#dc3545",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "30px", background: "#f1f3f6" }}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
