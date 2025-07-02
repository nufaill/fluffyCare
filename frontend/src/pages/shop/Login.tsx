import AuthLogin from "@/components/shared/AuthLogin";
import loginImage from '@/assets/shop/imageLogin.png';
import shopLogo from '@/assets/user/logo.png';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addShop } from "@/redux/slices/shop.slice";
import { loginShop } from "@/services/shop/authService";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (formData: { email: string; password: string }) => {
    try {
      const response = await loginShop(formData);
      console.log('Login response:', response); // Debug log
      console.log('Shop isVerified:', response.shop?.isVerified); // Debug log

      if (response.success) {
        dispatch(addShop(response.shop));
        // Optional: localStorage.setItem('shopToken', response.token);

        navigate('/shop/dashboard');
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.log(error)
      if (error.response.data.message === "Unauthorized: No user found in request") {
        navigate('/shop/shop-verify');
      } else {
        console.error('Shop login failed:', error);
        throw error;
      }
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