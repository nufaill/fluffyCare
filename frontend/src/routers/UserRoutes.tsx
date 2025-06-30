// UserRoutes.tsx - Updated with route protection
import { Routes, Route } from "react-router-dom";
import HomePage from "@/pages/user/Home";
import AboutPage from "@/pages/user/About";
import Login from "@/pages/user/Login";
import Signup from "@/pages/user/Signup";
import VerifyOtpPage from "@/pages/user/VerifyOtp";
import ForgotPassword from '@/pages/user/ForgotPasswordForm';
import ResetPassword from '@/pages/user/ResetPasswordForm';
import { PublicRoute } from '@/protected/PrivateRoute';

const UserRoutes = () => {
  return (
    <Routes>
      {/* Public routes - accessible to all */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      
      {/* Public routes - only for non-authenticated users */}
      <Route 
        path="/login" 
        element={
          <PublicRoute userType="user">
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <PublicRoute userType="user">
            <Signup />
          </PublicRoute>
        } 
      />
      <Route 
        path="/forgot-password" 
        element={
          <PublicRoute userType="user">
            <ForgotPassword />
          </PublicRoute>
        } 
      />
      <Route 
        path="/reset-password" 
        element={
          <PublicRoute userType="user">
            <ResetPassword />
          </PublicRoute>
        } 
      />
      
      
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      
      <Route path="/logout" element={<HomePage />} />
      
    </Routes>
  );
};

export default UserRoutes;