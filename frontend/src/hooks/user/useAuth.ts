// hooks/useAuth.ts - Custom authentication hooks
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '@/redux/store';
import { logoutUser } from '@/redux/slices/user.slice';
import { logoutShop } from '@/redux/slices/shop.slice';
import { logoutAdmin } from '@/redux/slices/admin.slice';

// User authentication hook
export const useUserAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const userState = useSelector((state: RootState) => state.user);
  
  const logout = () => {
    dispatch(logoutUser());
    navigate('/');
  };
  
  return {
    ...userState,
    logout,
    isLoggedIn: userState.isAuthenticated && !!userState.userDatas,
  };
};

// Shop authentication hook
export const useShopAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const shopState = useSelector((state: RootState) => state.shop);
  
  const logout = () => {
    dispatch(logoutShop());
    navigate('/join-us');
  };
  
  return {
    ...shopState,
    logout,
    isLoggedIn: shopState.isAuthenticated && !!shopState.shopData && !!shopState.token,
  };
};

// Admin authentication hook
export const useAdminAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const adminState = useSelector((state: RootState) => state.admin);
  
  const logout = () => {
    dispatch(logoutAdmin());
    navigate('/admin/login');
  };
  
  return {
    ...adminState,
    logout,
    isLoggedIn: !!adminState.adminDatas,
  };
};

// General authentication hook to check current user type
export const useCurrentAuth = () => {
  const userAuth = useUserAuth();
  const shopAuth = useShopAuth();
  const adminAuth = useAdminAuth();
  
  const getCurrentUserType = (): 'user' | 'shop' | 'admin' | null => {
    if (adminAuth.isLoggedIn) return 'admin';
    if (shopAuth.isLoggedIn) return 'shop';
    if (userAuth.isLoggedIn) return 'user';
    return null;
  };
  
  const getCurrentUserData = () => {
    const userType = getCurrentUserType();
    switch (userType) {
      case 'user':
        return userAuth.userDatas;
      case 'shop':
        return shopAuth.shopData;
      case 'admin':
        return adminAuth.adminDatas;
      default:
        return null;
    }
  };
  
  const logoutCurrent = () => {
    const userType = getCurrentUserType();
    switch (userType) {
      case 'user':
        userAuth.logout();
        break;
      case 'shop':
        shopAuth.logout();
        break;
      case 'admin':
        adminAuth.logout();
        break;
    }
  };
  
  return {
    userType: getCurrentUserType(),
    userData: getCurrentUserData(),
    logout: logoutCurrent,
    isAuthenticated: getCurrentUserType() !== null,
  };
};