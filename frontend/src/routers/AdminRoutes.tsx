// AdminRoutes.tsx - Updated with route protection
import { Routes, Route } from "react-router-dom";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import PrivateRoute, { PublicRoute } from '@/protected/PrivateRoute';

const AdminRoutes = () => {
  return (
    <Routes>
      
      <Route 
        path="/admin/login" 
        element={
          <PublicRoute userType="admin">
            <AdminLogin />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/admin/" 
        element={
          <PrivateRoute userType="admin">
            <AdminDashboard />
          </PrivateRoute>
        } 
      />
      <Route path="/admin/logout" element={<AdminLogin />} />
      
      {/* Example:
      <Route 
        path="/admin/users" 
        element={
          <PrivateRoute userType="admin">
            <AdminUsers />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/admin/shops" 
        element={
          <PrivateRoute userType="admin">
            <AdminShops />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/admin/analytics" 
        element={
          <PrivateRoute userType="admin">
            <AdminAnalytics />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/admin/settings" 
        element={
          <PrivateRoute userType="admin">
            <AdminSettings />
          </PrivateRoute>
        } 
      />
      */}
    </Routes>
  );
};

export default AdminRoutes;