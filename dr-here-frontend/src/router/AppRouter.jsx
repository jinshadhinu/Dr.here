import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/login";
import PatientLogin from "../pages/auth/PatientLogin";
import RegisterPatient from "../pages/auth/RegisterPatient";
import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Hospitals from "../pages/admin/Hospitals";
import AddHospital from "../pages/admin/AddHospital";
import HospitalLayout from "../components/hospital/HospitalLayout";
import HospitalDashboard from "../pages/hospital/HospitalDashboard";
import ChangePassword from "../pages/hospital/ChangePassword";
import Departments from "../pages/hospital/Departments";
import Doctors from "../pages/hospital/Doctors";
import Appointments from "../pages/hospital/Appointments";
import DoctorSchedule from "../pages/hospital/DoctorSchedule";
import Patients from "../pages/hospital/Patients";
import { AdminRoute, HospitalRoute, PatientRoute } from "./ProtectedRoutes";
import PatientLayout from "../components/patient/PatientLayout";
import PatientDashboard from "../pages/patient/PatientDashboard";
import BookAppointment from "../pages/patient/BookAppointment";
import PatientAppointments from "../pages/patient/PatientAppointments";
import PatientProfile from "../pages/patient/PatientProfile";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login-patient" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login-patient" element={<PatientLogin />} />
        <Route path="/register-patient" element={<RegisterPatient />} />

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
          <Route path="appointments" element={<Appointments />} />
          <Route path="patients" element={<Patients />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path="departments" element={<Departments />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="doctor-schedule" element={<DoctorSchedule />} />
        </Route>

        {/* PATIENT */}
        <Route
          path="/patient"
          element={
            <PatientRoute>
              <PatientLayout />
            </PatientRoute>
          }
        >
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="profile" element={<PatientProfile />} />
          <Route path="book-appointment" element={<BookAppointment />} />
          <Route path="appointments" element={<PatientAppointments />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter; //


