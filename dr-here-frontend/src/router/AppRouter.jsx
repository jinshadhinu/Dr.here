import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/login.jsx";
import HospitalDashboard from "../pages/HospitalDashboard/HospitalDashboard.jsx";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;

