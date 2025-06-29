// src/routes/AdminRoutes.tsx
import { Routes, Route } from "react-router-dom";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
// import ProtectedRoute from "@/components/ProtectedRoute";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/"  element={<AdminDashboard /> } />
      <Route path="/admin/logout" element={<AdminLogin />} />
    </Routes>
  );
};

export default AdminRoutes;