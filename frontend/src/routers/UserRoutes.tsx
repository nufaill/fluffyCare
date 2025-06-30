// UserRoutes.tsx - Updated with route protection
import { Routes, Route } from "react-router-dom";
import HomePage from "@/pages/user/Home";
import AboutPage from "@/pages/user/About";
import Login from "@/pages/user/Login";
import Signup from "@/pages/user/Signup";
import VerifyOtpPage from "@/pages/user/VerifyOtp";
import ForgotPassword from '@/pages/user/ForgotPasswordForm';
import ResetPassword from '@/pages/user/ResetPasswordForm';
import PrivateRoute, { PublicRoute } from '@/protected/PrivateRoute';

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
      
      {/* Semi-protected routes - for OTP verification process */}
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      
      {/* Logout route - clears user data and redirects */}
      <Route path="/logout" element={<HomePage />} />
      
      {/* Protected routes - only for authenticated users */}
      {/* Add your protected user routes here */}
      {/* Example:
      <Route 
        path="/profile" 
        element={
          <PrivateRoute userType="user">
            <UserProfile />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute userType="user">
            <UserDashboard />
          </PrivateRoute>
        } 
      />
      */}
    </Routes>
  );
};

export default UserRoutes;