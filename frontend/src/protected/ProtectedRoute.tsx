import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  userType: 'user' | 'shop' | 'admin';
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  userType, 
  redirectTo 
}) => {
  const location = useLocation();
  
  // Get authentication state based on user type
  const isAuthenticated = useSelector((state: RootState) => {
    switch (userType) {
      case 'user':
        return state.user.isAuthenticated;
    //   case 'shop':
    //     return state.shop.isAuthenticated;
    //   case 'admin':
    //     return state.admin.isAuthenticated;
      default:
        return false;
    }
  });

  const isLoading = useSelector((state: RootState) => {
    switch (userType) {
      case 'user':
        return state.user.isLoading;
    //   case 'shop':
    //     return state.shop.isLoading;
    //   case 'admin':
    //     return state.admin.isLoading;
      default:
        return false;
    }
  });

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, redirect to appropriate login page
  if (!isAuthenticated) {
    const defaultRedirects = {
      user: '/login',
      shop: '/shop/login',
      admin: '/admin/login'
    };

    const redirectPath = redirectTo || defaultRedirects[userType];
    
    return (
      <Navigate 
        to={redirectPath} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If authenticated, render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;