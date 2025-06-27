import { Routes, Route } from "react-router-dom";
import HomePage from "@/pages/user/Home";
import AboutPage from "@/pages/user/About";
import Login from "@/pages/user/Login";
import Signup from "@/pages/user/Signup";
import VerifyOtpPage from "@/pages/user/VerifyOtp";
import ForgotPassword from '@/pages/user/ForgotPasswordForm'
import ResetPassword from '@/pages/user/ResetPasswordForm'
const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/logout" element={<HomePage />} />
    </Routes>
  );
};

export default UserRoutes;
