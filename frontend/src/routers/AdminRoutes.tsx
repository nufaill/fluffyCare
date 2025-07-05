// AdminRoutes.tsx - Updated with route protection
import { Routes, Route } from "react-router-dom";
import PrivateRoute, { PublicRoute } from '@/protected/PrivateRoute';
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import CustomerDetails from "@/pages/admin/CustomerDetails";
import ShopDetails from "@/pages/admin/ShopDetails";
import ShopVerification from "@/pages/admin/ShopVerification";
import PetCategory from '@/pages/admin/PetCategory';
import PetServices from '@/pages/admin/PetServices';

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
      
      Example:
      <Route 
        path="/admin/users" 
        element={
          <PrivateRoute userType="admin">
            <CustomerDetails/>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/admin/shops" 
        element={
          <PrivateRoute userType="admin">
            <ShopDetails />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/admin/unverified" 
        element={
          <PrivateRoute userType="admin">
            <ShopVerification />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/admin/unverified" 
        element={
          <PrivateRoute userType="admin">
            <ShopVerification />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/admin/pet-category" 
        element={
          <PrivateRoute userType="admin">
            <PetCategory />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/admin/pet-services" 
        element={
          <PrivateRoute userType="admin">
            <PetServices />
          </PrivateRoute>
        } 
      />
    </Routes>
  );
};

export default AdminRoutes;