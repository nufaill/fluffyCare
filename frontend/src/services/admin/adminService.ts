// src/services/admin/adminService.ts
import adminAxios from "@/api/admin.axios";
import toast from 'react-hot-toast';

export const loginAdmin = async (data: { email: string; password: string }) => {
 

  try {
    const response = await adminAxios.post('/admin/login', data);

 

    if (response.data.success) {
      // Store admin data and token
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminDatas', JSON.stringify(response.data.admin));
    }

    return response.data;
  } catch (error: any) {
  
    
    const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
    toast.error(errorMessage, {
      position: 'top-right',
      duration: 4000,
      style: {
        background: '#FEE2E2',
        color: '#DC2626',
        border: '1px solid #F87171'
      }
    });

    console.error('Admin login error:', error);
    throw error;
  }
};

export const logoutAdmin = async () => {
  const loadingToast = toast.loading('Signing you out...', {
    position: 'top-right'
  });

  try {
    await adminAxios.post('/admin/logout');

    // Clear local storage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminDatas');

    toast.dismiss(loadingToast);
    toast.success('Logged out successfully! See you soon! 👋', {
      position: 'top-right',
      duration: 3000,
      style: {
        background: '#DBEAFE',
        color: '#1D4ED8',
        border: '1px solid #93C5FD'
      }
    });

    return { success: true };
  } catch (error) {
    toast.dismiss(loadingToast);

    // Clear local storage even if API call fails
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminDatas');

    toast.error('Logout failed, but cleared local data', {
      position: 'top-right'
    });

    console.error('Admin logout error:', error);
    return { success: true }; // Return success anyway since we cleared local data
  }
};