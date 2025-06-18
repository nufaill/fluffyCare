import AuthSignup from "@/components/shared/AuthSignup";
import signupImage from '@/assets/authImages/signup-image.png';
import shopLogo from '@/assets/user/logo.png'; 
import { useNavigate } from 'react-router-dom';
import type { SignupForm } from "@/types/auth.type";

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData: SignupForm) => {
    try {
      // Type guard to ensure we have shop form data
      if (formData.mode !== 'shop') {
        throw new Error('Invalid form mode for shop signup');
      }

      // Your shop signup API call here
      console.log('Shop Signup Form Submitted:', formData);
      
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Add basic fields
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('password', formData.password);
      submitData.append('city', formData.city);
      submitData.append('streetAddress', formData.streetAddress);
      submitData.append('buildingNumber', formData.buildingNumber);
      submitData.append('description', formData.description);
      
    
      if (formData.logo instanceof File) {
        submitData.append('logo', formData.logo);
      }
      if (formData.certificateUrl instanceof File) {
        submitData.append('certificateUrl', formData.certificateUrl);
      }
      
      // Add location if present
      if (formData.location) {
        submitData.append('location', JSON.stringify(formData.location));
      }
      
      // Example API call:
      // const response = await shopSignupAPI(submitData);
      // if (response.success) {
      //   navigate('/shop/login');
      // }
      navigate('/shop/signup');
    
    } catch (error) {
      console.error('Shop signup failed:', error);
      throw error; // Re-throw to handle in AuthSignup component
    }
  };

  return (
    <AuthSignup
      mode="shop"
      title="Join FluffyCare Business!"
      subtitle="Grow your pet business with our platform"
      backgroundImage={signupImage}
      loginRoute="/shop/login"
      onSubmit={handleSubmit}
      logo={shopLogo}
    />
  );
};

export default Signup;