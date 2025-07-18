import AuthSignup from "@/components/shared/AuthSignup";
import signupImage from '@/assets/authImages/signup-image.png';
import { useNavigate } from 'react-router-dom';
import { registerUser } from "@/services/user/auth.service";
import type { SignupForm } from "@/types/auth.type";
import { cloudinaryUtils } from "@/utils/cloudinary/cloudinary";

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData: SignupForm) => {
    try {
      if (formData.mode !== 'user') {
        throw new Error('Invalid form mode for user signup');
      }

      let profileImageUrl = "";

       if (formData.profileImage instanceof File) {
        profileImageUrl = await cloudinaryUtils.uploadImage(formData.profileImage);
      }

      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        profileImage: profileImageUrl, 
        location: formData.location || {},
      };

      await registerUser(userData);
      
      localStorage.setItem('pendingVerificationEmail', formData.email);
      
      navigate('/verify-otp', { 
        state: { email: formData.email },
        replace: true 
      });
      
    } catch (error) {
      console.error('User signup failed:', error);
      throw error;
    }
  };

  return (
    <AuthSignup
      mode="user"
      title="Join FluffyCare Today!"
      subtitle="Start your pet care journey with us"
      backgroundImage={signupImage}
      loginRoute="/login"
      onSubmit={handleSubmit}
    />
  );
};

export default Signup;