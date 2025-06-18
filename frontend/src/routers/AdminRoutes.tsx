// import { Routes, Route } from "react-router-dom";
// import AdminLogin from "@/pages/admin/Login";
// import AdminDashboard from "@/pages/admin/Dashboard";
// import UserManagement from "@/pages/admin/UserManagement";
// import ShopManagement from "@/pages/admin/ShopManagement";
// import ProtectedRoute from "@/components/ProtectedRoute";
// import PublicRoute from "@/components/PublicRoute";

// const AdminRoutes = () => {
//   return (
//     <Routes>
//       {/* Public routes for admin */}
//       <Route 
//         path="/admin/login" 
//         element={
//           <PublicRoute userType="admin" restricted>
//             <AdminLogin />
//           </PublicRoute>
//         } 
//       />
      
//       {/* Protected admin routes */}
//       <Route 
//         path="/admin/dashboard" 
//         element={
//           <ProtectedRoute userType="admin">
//             <AdminDashboard />
//           </ProtectedRoute>
//         } 
//       />
      
//       <Route 
//         path="/admin/users" 
//         element={
//           <ProtectedRoute userType="admin">
//             <UserManagement />
//           </ProtectedRoute>
//         } 
//       />
      
//       <Route 
//         path="/admin/shops" 
//         element={
//           <ProtectedRoute userType="admin">
//             <ShopManagement />
//           </ProtectedRoute>
//         } 
//       />
//     </Routes>
//   );
// };

// export default AdminRoutes;