import { Routes, Route } from "react-router-dom";
import ShopLogin from "@/pages/shop/Login";
import ShopSignup from "@/pages/shop/Signup";
import VendorLandingPage from "@/pages/shop/LandingPage";
import Dashboard from "@/pages/shop/Dashboard";

const ShopRoutes = () => {
  return (
    <Routes>
      <Route path="/join-us" element={<VendorLandingPage />} />
      <Route path="/shop/login" element={<ShopLogin />} />
      <Route path="/shop/signup" element={<ShopSignup />} />
      <Route path="/shop/dashboard" element={<Dashboard />} />
    </Routes>
  );
};

export default ShopRoutes;
