import React from 'react';
import defaultLogo from '@/assets/user/logo.png';

interface AuthImageSectionProps {
  backgroundImage: string;
  logo?: string;
}

const AuthImageSection: React.FC<AuthImageSectionProps> = ({ 
  backgroundImage, 
  logo = defaultLogo 
}) => {
  return (
    <div className="hidden lg:flex flex-1 bg-black relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      <div className="absolute top-4 left-4 z-20">
        <img
          src={logo}
          alt="Logo"
          className="w-32 h-auto filter brightness-0 invert"
        />
      </div>
    </div>
  );
};

export default AuthImageSection;