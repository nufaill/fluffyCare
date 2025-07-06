import AuthSignup from "@/components/shared/AuthSignup";
import signupImage from '@/assets/authImages/signup-image.png';
import { useNavigate } from 'react-router-dom';
import { registerUser } from "@/services/user/auth.service";
import type { SignupForm } from "@/types/auth.type";

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData: SignupForm) => {
    try {
      if (formData.mode !== 'user') {
        throw new Error('Invalid form mode for user signup');
      }

      let profileImageUrl = "";

      if (formData.profileImage instanceof File) {
        const uploadData = new FormData();
        uploadData.append('file', formData.profileImage);
        uploadData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: uploadData,
          }
        );

        const data = await response.json();

        if (!response.ok) throw new Error(data.error?.message || "Image upload failed");

        profileImageUrl = data.secure_url;
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