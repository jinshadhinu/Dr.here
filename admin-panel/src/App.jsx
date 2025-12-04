import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Dashboard from "./pages/Dashboard";
import Hospitals from "./pages/Hospitals";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

// Admin Layout
import AdminLayout from "./components/AdminLayout";

// Token-protected route
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <AdminLayout><Dashboard /></AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/hospitals"
          element={
            <PrivateRoute>
              <AdminLayout><Hospitals /></AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <AdminLayout><Users /></AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <AdminLayout><Settings /></AdminLayout>
            </PrivateRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
