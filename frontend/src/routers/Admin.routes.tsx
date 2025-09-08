// AdminRoutes.tsx 
import { Routes, Route } from "react-router-dom";
import PrivateRoute, { PublicRoute } from '@/protected/PrivateRoute';
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import CustomerDetails from "@/pages/admin/CustomerDetails";
import ShopDetails from "@/pages/admin/ShopDetails";
import ShopVerification from "@/pages/admin/ShopVerification";
import PetCategory from '@/pages/admin/PetCategory';
import PetServices from '@/pages/admin/PetServices';
import WalletPage from "@/pages/admin/Admin-Wallet";
import AppointmentManagement from "@/pages/admin/appointment-management";
import AdminSubscriptionPage from "@/pages/admin/admin-subscriptions.tsx";
import ReviewAdminDashboard from "@/pages/admin/ReviewAdminDashboard";

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
        path="/admin/pet-types" 
        element={
          <PrivateRoute userType="admin">
            <PetCategory />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/admin/service-types" 
        element={
          <PrivateRoute userType="admin">
            <PetServices />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/admin/wallet" 
        element={
          <PrivateRoute userType="admin">
            <WalletPage />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/admin/appointments" 
        element={
          <PrivateRoute userType="admin">
            <AppointmentManagement/>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/admin/subscription" 
        element={
          <PrivateRoute userType="admin">
            <AdminSubscriptionPage/>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/admin/reviews" 
        element={
          <PrivateRoute userType="admin">
            <ReviewAdminDashboard/>
          </PrivateRoute>
        } 
      />
    </Routes>
  );
};

export default AdminRoutes;