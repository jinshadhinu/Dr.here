import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/login.jsx";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to /login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Admin Panel */}
        <Route path="/admin/dashboard" element={<h1>Admin Dashboard</h1>} />

        {/* Hospital Panel */}
        <Route path="/hospital/dashboard" element={<h1>Hospital Dashboard</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
