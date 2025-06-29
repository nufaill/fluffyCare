import { Routes, Route } from "react-router-dom";
import AdminLogin from "@/pages/admin/login";
// import AdminDashboard from "@/pages/admin/Dashboard";
// import UserManagement from "@/pages/admin/UserManagement";
// import ShopManagement from "@/pages/admin/ShopManagement";
// import ProtectedRoute from "@/components/ProtectedRoute";
// import PublicRoute from "@/components/PublicRoute";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/shop/login" element={<AdminLogin />} />
      {/* <Route path="/shop/dashboard" element={<Dashboard />} /> */}
      <Route path="/shop/logout" element={<AdminLogin />} />
    </Routes>
  );
};

export default AdminRoutes;