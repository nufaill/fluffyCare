// PrivateRoute.tsx - For authenticated users only
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

interface PrivateRouteProps {
  children: React.ReactNode;
  userType: 'user' | 'shop' | 'admin';
  redirectTo?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  userType,
  redirectTo 
}) => {
  const location = useLocation();
  
  const userAuth = useSelector((state: RootState) => ({
    isAuthenticated: state.user.isAuthenticated,
    userData: state.user.userDatas
  }));
  
  const shopAuth = useSelector((state: RootState) => ({
    isAuthenticated: state.shop.isAuthenticated,
    shopData: state.shop.shopData,
    token: state.shop.token
  }));
  
  const adminAuth = useSelector((state: RootState) => ({
    adminData: state.admin.adminDatas
  }));

  const checkAuthentication = () => {
    switch (userType) {
      case 'user':
        return userAuth.isAuthenticated && userAuth.userData;
      case 'shop':
        return shopAuth.isAuthenticated && shopAuth.shopData && shopAuth.token;
      case 'admin':
        return adminAuth.adminData !== null;
      default:
        return false;
    }
  };

  const getRedirectPath = () => {
    if (redirectTo) return redirectTo;
    
    switch (userType) {
      case 'user':
        return '/login';
      case 'shop':
        return '/shop/login';
      case 'admin':
        return '/admin/login';
      default:
        return '/';
    }
  };

  if (!checkAuthentication()) {
    return <Navigate to={getRedirectPath()} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;

// PublicRoute.tsx 
interface PublicRouteProps {
  children: React.ReactNode;
  userType: 'user' | 'shop' | 'admin';
  redirectTo?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  userType,
  redirectTo 
}) => {
  const location = useLocation();
  
  const userAuth = useSelector((state: RootState) => ({
    isAuthenticated: state.user.isAuthenticated,
    userData: state.user.userDatas
  }));
  
  const shopAuth = useSelector((state: RootState) => ({
    isAuthenticated: state.shop.isAuthenticated,
    shopData: state.shop.shopData,
    token: state.shop.token
  }));
  
  const adminAuth = useSelector((state: RootState) => ({
    adminData: state.admin.adminDatas
  }));

  const checkAuthentication = () => {
    switch (userType) {
      case 'user':
        return userAuth.isAuthenticated && userAuth.userData;
      case 'shop':
        return shopAuth.isAuthenticated && shopAuth.shopData && shopAuth.token;
      case 'admin':
        return adminAuth.adminData !== null;
      default:
        return false;
    }
  };

  const getRedirectPath = () => {
    if (redirectTo) return redirectTo;
    
    const from = location.state?.from?.pathname;
    
    switch (userType) {
      case 'user':
        return from || '/';
      case 'shop':
        return from || '/shop/dashboard';
      case 'admin':
        return from || '/admin/';
      default:
        return '/';
    }
  };

  // If user is already authenticated, redirect to dashboard/home
  if (checkAuthentication()) {
    return <Navigate to={getRedirectPath()} replace />;
  }

  return <>{children}</>;
};

// RoleBasedRoute.tsx - For specific role-based access
interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('user' | 'shop' | 'admin')[];
  fallbackPath?: string;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/'
}) => {
  const userAuth = useSelector((state: RootState) => ({
    isAuthenticated: state.user.isAuthenticated,
    userData: state.user.userDatas
  }));
  
  const shopAuth = useSelector((state: RootState) => ({
    isAuthenticated: state.shop.isAuthenticated,
    shopData: state.shop.shopData,
    token: state.shop.token
  }));
  
  const adminAuth = useSelector((state: RootState) => ({
    adminData: state.admin.adminDatas
  }));

  const getCurrentUserRole = (): string | null => {
    if (adminAuth.adminData) return 'admin';
    if (shopAuth.isAuthenticated && shopAuth.shopData && shopAuth.token) return 'shop';
    if (userAuth.isAuthenticated && userAuth.userData) return 'user';
    return null;
  };

  const currentRole = getCurrentUserRole();
  
  if (!currentRole || !allowedRoles.includes(currentRole as any)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};