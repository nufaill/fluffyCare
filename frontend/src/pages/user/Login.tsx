import AuthLogin from "@/components/shared/AuthLogin";
import loginImage from '@/assets/authImages/login-image.png';
import { useNavigate } from 'react-router-dom';
import { loginUser } from "@/services/user/authService";
import { useDispatch } from "react-redux";
import { addUser } from "@/redux/slices/user.slice";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const handleSubmit = async (formData: { email: string; password: string }) => {

    try {
      const response = await loginUser(formData);
      dispatch(addUser(response?.user))
      if(response.success){
        navigate('/');
      }
      
      
    } catch (error) {
      console.error('User login failed:', error);
      throw error;
    }
  };

  return (
    <AuthLogin
      title="Welcome Back to FluffyCare!"
      subtitle="Your pet's care is just a click away"
      backgroundImage={loginImage}
      signupRoute="/signup"
      role="user"
      onSubmit={handleSubmit}
    />
  );
};

export default Login;