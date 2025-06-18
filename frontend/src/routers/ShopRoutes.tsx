import { Routes, Route } from "react-router-dom";
import ShopLogin from "@/pages/shop/Login";
import ShopSignup from "@/pages/shop/Signup";
import VendorLandingPage from "@/pages/shop/VendorLandingPage";

const ShopRoutes = () => {
  return (
    <Routes>
      <Route path="/join-us" element={<VendorLandingPage />} />
      <Route path="/shop/login" element={<ShopLogin />} />
      <Route path="/shop/signup" element={<ShopSignup />} />
    </Routes>
  );
};

export default ShopRoutes;
