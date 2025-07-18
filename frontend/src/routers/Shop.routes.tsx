// ShopRoutes.tsx - Updated with route protection
import { Routes, Route } from "react-router-dom";
import ShopLogin from "@/pages/shop/Login";
import ShopSignup from "@/pages/shop/Signup";
import VendorLandingPage from "@/pages/shop/LandingPage";
import Dashboard from "@/pages/shop/Dashboard";
import VerifyOtpPage from "@/pages/shop/VerifyOtp";
import ForgotPassword from "@/pages/shop/ForgotPasswordForm";
import ResetPassword from "@/pages/shop/ResetPasswordForm";
import VerifyShop from "@/pages/shop/Thank-you-page";
import PrivateRoute, { PublicRoute } from '@/protected/PrivateRoute';
import ShopProfilePage from './../pages/shop/ShopProfilePage';
import ShopProfilePageEdit from './../pages/shop/ShopProfilePageEdit'
import ServicesPage from "@/pages/shop/Services";

const ShopRoutes = () => {
  return (
    <Routes>
      <Route path="/join-us" element={<VendorLandingPage />} />

      <Route
        path="/shop/login"
        element={
          <PublicRoute userType="shop">
            <ShopLogin />
          </PublicRoute>
        }
      />
      <Route
        path="/shop/signup"
        element={
          <PublicRoute userType="shop">
            <ShopSignup />
          </PublicRoute>
        }
      />
      <Route
        path="/shop/forgot-password"
        element={
          <PublicRoute userType="shop">
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/shop/reset-password"
        element={
          <PublicRoute userType="shop">
            <ResetPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/shop/shop-verify"
        element={
          <PublicRoute userType="shop">
            <VerifyShop />
          </PublicRoute>
        }
      />

      <Route path="/shop/verify-otp" element={<VerifyOtpPage />} />


      <Route
        path="/shop/dashboard"
        element={
          <PrivateRoute userType="shop">
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/shop/profile"
        element={
          <PrivateRoute userType="shop">
            <ShopProfilePage/>
          </PrivateRoute>
        }
      />
      <Route
        path="/shop/profile/update"
        element={
          <PrivateRoute userType="shop">
            <ShopProfilePageEdit/>
          </PrivateRoute>
        }
      />
      <Route
        path="/shop/services"
        element={
          <PrivateRoute userType="shop">
            <ServicesPage/>
          </PrivateRoute>
        }
      />

      <Route path="/shop/logout" element={<VendorLandingPage />} />

    </Routes>
  );
};

export default ShopRoutes;