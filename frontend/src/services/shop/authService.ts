// src/services/userService/authService.ts
import shopAxios from "@/api/shop.axios";
import toast from 'react-hot-toast';

// Helper function to extract error message
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
};

export const registerShop = async (data: FormData | any) => {
  const loadingToast = toast.loading('Creating your account...', {
    position: 'top-right',
  });

  try {
    const response = await shopAxios.post('/shop/signup', data, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    toast.dismiss(loadingToast);
    toast.success('Account created successfully! Welcome aboard! 🎉', {
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

    console.error('User registration error:', error);
    throw error;
  }
};

export const loginShop = async (data: { email: string; password: string; role?: string }) => {

  try {
    const response = await shopAxios.post('/shop/login', data);


    // Store user data if needed
    if (response.data.token) {
      localStorage.setItem('userToken', response.data.token);
    }
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {

    console.error('User login error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  const loadingToast = toast.loading('Signing you out...', {
    position: 'top-right',
  });

  try {
    const response = await shopAxios.post('/logout');
    
    // Clear local storage
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');

    toast.dismiss(loadingToast);
    toast.success('Logged out successfully! See you soon! 👋', {
      position: 'top-right',
      duration: 3000,
      style: {
        background: '#DBEAFE',
        color: '#1D4ED8',
        border: '1px solid #93C5FD',
      },
    });

    return response.data;
  } catch (error) {
    toast.dismiss(loadingToast);
    
    // Clear local storage even if API call fails
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    

    console.error('User logout error:', error);
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
    icon: '⚠️',
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
    icon: '🌐',
  });
};