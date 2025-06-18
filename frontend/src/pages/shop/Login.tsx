// src/pages/shop/Login.tsx
import AuthLogin from "@/components/shared/AuthLogin";
import loginImage from '@/assets/shop/imageLogin.png';
import shopLogo from '@/assets/user/logo.png'; 
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData: { email: string; password: string }) => {
    try {
      console.log('Shop Login Form Submitted:', formData);
      
      // Example API call:
      // const response = await shopLoginAPI(formData);
      // if (response.success) {
      //   navigate('/shop/dashboard');
      // }
      
     
      setTimeout(() => {
        navigate('/shop/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Shop login failed:', error);
      throw error; 
    }
  };

  return (
    <AuthLogin
      title="Welcome Back to FluffyCare Business!"
      subtitle="Manage your pet business with ease"
      backgroundImage={loginImage}
      signupRoute="/shop/signup"
      role="shop"
      onSubmit={handleSubmit}
      logo={shopLogo}
    />
  );
};

export default Login;