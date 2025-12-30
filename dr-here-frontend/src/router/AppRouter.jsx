import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/login";
import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Hospitals from "../pages/admin/Hospitals";
import AddHospital from "../pages/admin/AddHospital";
import HospitalLayout from "../components/hospital/HospitalLayout";
import HospitalDashboard from "../pages/hospital/HospitalDashboard";
import ChangePassword from "../pages/hospital/ChangePassword";
import Departments from "../pages/hospital/Departments";
import { AdminRoute, HospitalRoute } from "./ProtectedRoutes";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="hospitals" element={<Hospitals />} />
          <Route path="add-hospital" element={<AddHospital />} />
        </Route>

        {/* HOSPITAL */}
        <Route
          path="/hospital"
          element={
            <HospitalRoute>
              <HospitalLayout />
            </HospitalRoute>
          }
        >
          <Route path="dashboard" element={<HospitalDashboard />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="departments" element={<Departments />} />
          {/* You can later add:
              <Route path="doctors" element={<DoctorsPage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
           */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter; //


