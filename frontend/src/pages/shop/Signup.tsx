// src/pages/shop/Signup.tsx
import React from 'react';
import AuthSignup from "@/components/shared/AuthSignup";
import signupImage from '@/assets/authImages/signup-image.png';
import shopLogo from '@/assets/user/logo.png';
import { useNavigate } from 'react-router-dom';
import { registerShop } from "@/services/shop/auth.service";
import { StorageUtils } from '@/types/shop.type';
import type { SignupForm } from "@/types/auth.type";

interface CloudinaryUploadResponse {
  secure_url: string;
  error?: {
    message: string;
  };
}

interface CloudinaryErrorResponse {
  error?: {
    message: string;
  };
}

const ShopSignup: React.FC = () => {
  const navigate = useNavigate();

  const uploadToCloudinary = async (file: File, type: 'logo' | 'certificate'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData: CloudinaryErrorResponse = await response.json();
      throw new Error(errorData.error?.message || `${type} upload failed`);
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (formData: SignupForm): Promise<void> => {
    try {
      if (formData.mode !== 'shop') {
        throw new Error('Invalid form mode for shop signup');
      }

      let logoUrl = "";
      let certificateUrl = "";

      // Upload shop logo to Cloudinary
      if (formData.logo instanceof File) {
        logoUrl = await uploadToCloudinary(formData.logo, 'logo');
      }

      // Upload shop certificate to Cloudinary
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