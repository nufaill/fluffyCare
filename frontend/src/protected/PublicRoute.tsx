import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

interface PublicRouteProps {
  children: React.ReactNode;
  userType: 'user' | 'shop' | 'admin';
  redirectTo?: string;
  restricted?: boolean; // If true, authenticated users can't access this route
}

const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  userType, 
  redirectTo,
  restricted = false 
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

  // If this is a restricted route (like login/signup) and user is authenticated,
  // redirect to dashboard or home
  if (restricted && isAuthenticated) {
    const defaultRedirects = {
      user: '/',
      shop: '/shop/dashboard',
      admin: '/admin/dashboard'
    };

    const redirectPath = redirectTo || defaultRedirects[userType];
    
    // Use the 'from' location if available (where user was trying to go before login)
    const from = location.state?.from?.pathname || redirectPath;
    
    return <Navigate to={from} replace />;
  }

  // For non-restricted public routes or unauthenticated users, render the component
  return <>{children}</>;
};

export default PublicRoute;