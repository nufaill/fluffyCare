import { Routes, Route } from "react-router-dom";
import HomePage from "@/pages/user/Home";
import AboutPage from "@/pages/user/About";
import Login from "@/pages/user/Login";
import Signup from "@/pages/user/Signup";

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
};

export default UserRoutes;
