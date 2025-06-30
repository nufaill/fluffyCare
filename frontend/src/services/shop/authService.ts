// services/shop/authService.ts
import shopAxios from "@/api/shop.axios";
import toast from 'react-hot-toast';
import {
  type ShopRegisterData,
  type ShopLoginData,
  type ShopAuthResponse,
  StorageUtils,
  ErrorHandler,
  type OtpVerificationData,
  type ResendOtpData,
  type OtpResponse
} from '@/types/shop.type';
import type { AxiosResponse } from 'axios';


const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}

export const registerShop = async (data: ShopRegisterData): Promise<ShopAuthResponse> => {
  console.log('[registerShop] Sending registration data:', data);
  const loadingToast = toast.loading('Creating your account...', {
    position: 'top-right',
  });

  try {
    const response: AxiosResponse<ShopAuthResponse> = await shopAxios.post('/signup', data, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    console.log('[registerShop] Registration successful:', response.data);
    toast.dismiss(loadingToast);
    toast.success('Account created successfully! Welcome aboard! 脂', {
      position: 'top-right',
      duration: 5000,
      style: {
        background: '#DCFCE7',
        color: '#16A34A',
        border: '1px solid #BBF7D0',
      },
    });

    return response.data;
  } catch (error) {
    toast.dismiss(loadingToast);
    const errorMessage = ErrorHandler.extractMessage(error);

    console.error('[registerShop] Registration error:', errorMessage);
    toast.error(errorMessage, {
      position: 'top-right',
      duration: 5000,
      style: {
        background: '#FEE2E2',
        color: '#DC2626',
        border: '1px solid #FECACA',
      },
    });

    throw error;
  }
};

export const loginShop = async (data: ShopLoginData): Promise<ShopAuthResponse> => {
  console.log('[loginShop] Sending login data:', data);

  try {
    const response: AxiosResponse<ShopAuthResponse> = await shopAxios.post('/login', data);

    console.log('[loginShop] Login successful, response:', response.data);

    // Store shop-specific token and data using type-safe utilities
    if (response.data.token) {
      StorageUtils.setShopToken(response.data.token);
      console.log('[loginShop] Shop token stored in localStorage');
    }

    if (response.data.shop) {
      StorageUtils.setShopData(response.data.shop);
      console.log('[loginShop] Shop data stored in localStorage');
    }

    return response.data;
  } catch (error) {
    const errorMessage = ErrorHandler.extractMessage(error);
    console.error('[loginShop] Login error:', errorMessage);

    // Show error toast
    toast.error(errorMessage, {
      position: 'top-right',
      duration: 5000,
      style: {
        background: '#FEE2E2',
        color: '#DC2626',
        border: '1px solid #FECACA',
      },
    });

    throw error;
  }
};

export const logoutShop = async (): Promise<{ success: boolean }> => {
  console.log('[logoutShop] Initiating logout');
  const loadingToast = toast.loading('Signing you out...', {
    position: 'top-right',
  });

  try {
    // Clear shop-specific data using type-safe utilities
    StorageUtils.clearShopAuth();
    console.log('[logoutShop] Cleared shop localStorage');

    toast.dismiss(loadingToast);
    toast.success('Logged out successfully! See you soon!', {
      position: 'top-right',
      duration: 3000,
      style: {
        background: '#DBEAFE',
        color: '#1D4ED8',
        border: '1px solid #93C5FD',
      },
    });

    return { success: true };
  } catch (error) {
    toast.dismiss(loadingToast);

    // Clear localStorage anyway using type-safe utilities
    StorageUtils.clearShopAuth();
    console.warn('[logoutShop] Logout completed with cleanup');

    const errorMessage = ErrorHandler.extractMessage(error);
    console.error('[logoutShop] Logout error:', errorMessage);
    throw error;
  }
};

export const verifyOtp = async (data: OtpVerificationData): Promise<OtpResponse> => {
  try {
    const response: AxiosResponse<OtpResponse> = await shopAxios.post('/shop/verify-otp', data);
    return response.data;
  } catch (error) {
    const errorMessage = ErrorHandler.extractMessage(error);
    console.error('[verifyOtp] Verification error:', errorMessage);
    throw error;
  }
};

export const resendOtp = async (data: ResendOtpData): Promise<OtpResponse> => {
  try {
    const response: AxiosResponse<OtpResponse> = await shopAxios.post('/shop/resend-otp', data);
    return response.data;
  } catch (error) {
    const errorMessage = ErrorHandler.extractMessage(error);
    console.error('[resendOtp] Resend error:', errorMessage);
    throw error;
  }
};
export const shopSendResetLink = async (email: string) => {
  const loadingToast = toast.loading('Sending reset link...', {
    position: 'top-right',
  });

  try {
    const response = await shopAxios.post('/shop/forgot-password', { email }, {
      withCredentials: true
    });

    toast.dismiss(loadingToast);
    toast.success('Reset link sent to your email! 透', {
      position: 'top-right',
      duration: 5000,
      style: {
        background: '#DCFCE7',
        color: '#16A34A',
        border: '1px solid #BBF7D0',
      },
    });

    return response.data;
  } catch (error) {
    toast.dismiss(loadingToast);
    const errorMessage = getErrorMessage(error);

    toast.error(errorMessage, {
      position: 'top-right',
      duration: 5000,
      style: {
        background: '#FEE2E2',
        color: '#DC2626',
        border: '1px solid #FECACA',
      },
    });

    console.error('Send reset link error:', error);
    throw error;
  }
};

// Fix resetPassword function
export const shopResetPassword = async (data: { 
  token: string;
  password: string;
  confirmPassword: string;
}) => {
  const loadingToast = toast.loading('Resetting password...', {
    position: 'top-right',
  });

  try {
    const response = await shopAxios.post('/shop/reset-password', {
      token: data.token,
      password: data.password,
      confirmPassword: data.confirmPassword
    }, {
      withCredentials: true
    });

    toast.dismiss(loadingToast);
    toast.success('Password reset successfully! 脂', {
      position: 'top-right',
      duration: 5000,
      style: {
        background: '#DCFCE7',
        color: '#16A34A',
        border: '1px solid #BBF7D0',
      },
    });

    return response.data;
  } catch (error) {
    toast.dismiss(loadingToast);
    const errorMessage = getErrorMessage(error);

    toast.error(errorMessage, {
      position: 'top-right',
      duration: 5000,
      style: {
        background: '#FEE2E2',
        color: '#DC2626',
        border: '1px solid #FECACA',
      },
    });

    console.error('Reset password error:', error);
    throw error;
  }
};


// Additional utility functions for better UX
export const showValidationErrors = (errors: Record<string, string>) => {
  const errorMessages = Object.values(errors);
  const message = errorMessages.length > 1
    ? `Please fix ${errorMessages.length} form errors`
    : errorMessages[0];

  toast.error(message, {
    position: 'top-right',
    duration: 4000,
    style: {
      background: '#FEE2E2',
      color: '#DC2626',
      border: '1px solid #FECACA',
    },
    icon: '笞ｸ',
  });
};

export const showNetworkError = () => {
  toast.error('Network error. Please check your connection and try again.', {
    position: 'top-right',
    duration: 6000,
    style: {
      background: '#FEE2E2',
      color: '#DC2626',
      border: '1px solid #FECACA',
    },
    icon: '倹',
  });
};
// Utility functions for authentication state
export const getShopAuthToken = (): string | null => {
  return StorageUtils.getShopToken();
};

export const getShopData = () => {
  return StorageUtils.getShopData();
};

export const isShopAuthenticated = (): boolean => {
  const token = StorageUtils.getShopToken();
  const shopData = StorageUtils.getShopData();
  return !!(token && shopData);
};