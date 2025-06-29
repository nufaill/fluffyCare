import AuthLogin from "@/components/shared/AuthLogin";
import loginImage from '@/assets/authImages/login-image.png';
import { useNavigate } from 'react-router-dom';
import { loginUser } from "@/services/user/authService";
import { useDispatch } from "react-redux";
// import { addUser } from "@/redux/slices/admin.slice";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const handleSubmit = async (formData: { email: string; password: string }) => {

    try {
    //   const response = await loginAdmin(formData);
    //   dispatch(addAdmin(response?.admin))
    //   if(response.success){
    //     navigate('/admin/dashboard');
    //   }
      
      
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
      signupRoute="/signup"
      role="admin"
      onSubmit={handleSubmit}
    />
  );
};

export default AdminLogin;