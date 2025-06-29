import { Routes, Route } from "react-router-dom";
import ShopLogin from "@/pages/shop/Login";
import ShopSignup from "@/pages/shop/Signup";
import VendorLandingPage from "@/pages/shop/LandingPage";
import Dashboard from "@/pages/shop/Dashboard";
import VerifyOtpPage from "@/pages/shop/VerifyOtp";
import ForgotPassword from "@/pages/shop/ForgotPasswordForm";
import ResetPassword from "@/pages/shop/ResetPasswordForm";

const ShopRoutes = () => {
  return (
    <Routes>
      <Route path="/join-us" element={<VendorLandingPage />} />
      <Route path="/shop/login" element={<ShopLogin />} />
      <Route path="/shop/signup" element={<ShopSignup />} />
      <Route path="/shop/dashboard" element={<Dashboard />} />
      <Route path="/shop/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/shop/forgot-password" element={<ForgotPassword />} />
      <Route path="/shop/reset-password" element={<ResetPassword />} />
      <Route path="/shop/logout" element={<VendorLandingPage />} />
    </Routes>
  );
};

export default ShopRoutes;
