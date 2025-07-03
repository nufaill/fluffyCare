// UserRoutes.tsx - Updated with route protection
import { Routes, Route } from "react-router-dom";
import HomePage from "@/pages/user/Home";
import AboutPage from "@/pages/user/About";
import Login from "@/pages/user/Login";
import Signup from "@/pages/user/Signup";
import VerifyOtpPage from "@/pages/user/VerifyOtp";
import ForgotPassword from '@/pages/user/ForgotPasswordForm';
import ResetPassword from '@/pages/user/ResetPasswordForm';
import UserDetails from '@/pages/user/user-profile';
import UserEdit from '@/pages/user/user-profile-edit';
import PetDetails from '@/pages/user/pet-details';
import Addpets from '@/pages/user/add-pet';
import PrivateRoute, { PublicRoute } from '@/protected/PrivateRoute';

const UserRoutes = () => {
  return (
    <Routes>
      {/* Public routes - accessible to all */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      
      {/* Public routes  */}
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
      {/* <Route 
        path="/profile" 
        element={
          <PrivateRoute userType="user">
            <UserDetails />
          </PrivateRoute>
        } 
      />
       */}
      
      <Route path="/verify-otp" element={<VerifyOtpPage />} />

      <Route path="/profile" element={<UserDetails/>} />

      <Route path="/profile/update" element={<UserEdit/>} />

      <Route path="/pets" element={<PetDetails/>} />

      <Route path="/add-pets" element={<Addpets/>} />
      
      <Route path="/logout" element={<HomePage />} />
      
    </Routes>
  );
};

export default UserRoutes;