// src/pages/shop/Signup.tsx
import React from 'react';
import AuthSignup from "@/components/shared/AuthSignup";
import signupImage from '@/assets/authImages/signup-image.png';
import shopLogo from '@/assets/user/logo.png';
import { useNavigate } from 'react-router-dom';
import { registerShop } from "@/services/shop/auth.service";
import { StorageUtils } from '@/types/shop.type';
import type { SignupForm } from "@/types/auth.type";
import { cloudinaryUtils } from "@/utils/cloudinary/cloudinary";

const ShopSignup: React.FC = () => {
  const navigate = useNavigate();

 const uploadToCloudinary = async (file: File, type: 'logo' | 'certificate'): Promise<string> => {
    try {
      return await cloudinaryUtils.uploadImage(file);
    } catch (error) {
      throw new Error(`${type} upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSubmit = async (formData: SignupForm): Promise<void> => {
    try {
      if (formData.mode !== 'shop') {
        throw new Error('Invalid form mode for shop signup');
      }

     let logoUrl = "";
      let certificateUrl = "";

      if (formData.logo instanceof File) {
        logoUrl = await uploadToCloudinary(formData.logo, 'logo');
      }

      if (formData.certificateUrl instanceof File) {
        certificateUrl = await uploadToCloudinary(formData.certificateUrl, 'certificate');
      }

      
      const shopData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        city: formData.city,
        streetAddress: formData.streetAddress,
        description: formData.description,
        logo: logoUrl,
        certificateUrl,
        location: formData.location || { type: "Point", coordinates: [0, 0] },
      };

   
      await registerShop(shopData);
      

      StorageUtils.setPendingVerificationEmail(formData.email);
      
      navigate('/shop/verify-otp', {
        state: { email: formData.email },
        replace: true
      });

    } catch (error) {
      console.error("Shop signup failed:", error);
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

export default ShopSignup;