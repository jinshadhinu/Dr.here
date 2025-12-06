import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Panel */}
        <Route
          path="/admin/dashboard"
          element={<h1>Admin Dashboard</h1>}
        />

        {/* Hospital Panel */}
        <Route
          path="/hospital/dashboard"
          element={<h1>Hospital Dashboard</h1>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;