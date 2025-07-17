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
import { Services } from "@/pages/user/service";
import EditPetPage from "@/pages/user/edit pet"
import { ServiceDetails } from "@/pages/user/serviceDetails";
import PrivateRoute, { PublicRoute } from '@/protected/PrivateRoute';

const UserRoutes = () => {
  return (
    <Routes>
      {/* Public routes - accessible to all */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />

      {/* Public routes for unauthenticated users */}
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
      <Route path="/services" element={<Services />} />
      <Route path="/services/:id" element={<ServiceDetails />} />
      {/* Protected routes - require authentication */}
      <Route
        path="/profile"
        element={
          <PrivateRoute userType="user">
            <UserDetails />
          </PrivateRoute>
        }
      />

      <Route
        path="/profile/update"
        element={
          <PrivateRoute userType="user">
            <UserEdit />
          </PrivateRoute>
        }
      />

      <Route
        path="/pets"
        element={
          <PrivateRoute userType="user">
            <PetDetails />
          </PrivateRoute>
        }
      />

      <Route
        path="/add-pets"
        element={
          <PrivateRoute userType="user">
            <Addpets />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit-pet/:petId"
        element={
          <PrivateRoute userType="user">
            <EditPetPage />
          </PrivateRoute>
        }
      />

      <Route path="/logout" element={<HomePage />} />
    </Routes>
  );
};

export default UserRoutes;