// src/pages/admin/Login.tsx
import AuthLogin from "@/components/shared/AuthLogin";
import loginImage from '@/assets/authImages/login-image.png';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from "@/services/admin/admin.service";
import { useDispatch } from "react-redux";
import { addAdmin } from "@/redux/slices/admin.slice"; 

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (formData: { email: string; password: string }) => {
    try {
      const response = await loginAdmin(formData);
      dispatch(addAdmin(response?.admin)); 
      if (response.success) {
        navigate('/admin/');
      }
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    }
  };

  return (
    <AuthLogin
      title="Welcome Back to FluffyCare!"
      subtitle="Your pet's care is just a click away"
      backgroundImage={loginImage}
      signupRoute=""
      role="admin"
      onSubmit={handleSubmit}
    />
  );
};

export default AdminLogin;