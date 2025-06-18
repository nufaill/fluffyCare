import userAxios from "@/api/user.axios";
// import authAxios from "@/api/auth.axios";


export const registerUser = async (data: FormData | any) => {
  try {
    const response = await userAxios.post('/signup', data, {
     headers: {
  "Content-Type": "application/json"
}

    });
    return response.data;
  } catch (error) {
    console.error('User registration error:', error);
    throw error;
  }
};

export const loginUser = async (data: { email: string; password: string }) => {
  try {
    const response = await userAxios.post('/login', data);
    return response.data;
  } catch (error) {
    console.error('User login error:', error);
    throw error;
  }
};
export const logoutUser = async () => {
  try {
    const response = await userAxios.post('/logout');
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    return response.data;
  } catch (error) {
    console.error('User logout error:', error);
    // Clear local storage even if API call fails
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    throw error;
  }
};

// // Shop authentication services
// export const registerShop = async (data: FormData | any) => {
//   try {
//     const response = await authAxios.post('/shop/signup', data, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Shop registration error:', error);
//     throw error;
//   }
// };

// export const loginShop = async (data: { email: string; password: string }) => {
//   try {
//     const response = await authAxios.post('/shop/login', data);
//     return response.data;
//   } catch (error) {
//     console.error('Shop login error:', error);
//     throw error;
//   }
// };

// // Admin authentication services
// export const loginAdmin = async (data: { email: string; password: string }) => {
//   try {
//     const response = await authAxios.post('/admin/login', data);
//     return response.data;
//   } catch (error) {
//     console.error('Admin login error:', error);
//     throw error;
//   }
// };

// // Logout services

// export const logoutShop = async () => {
//   try {
//     const response = await authAxios.post('/shop/logout');
//     localStorage.removeItem('shopToken');
//     localStorage.removeItem('shop');
//     return response.data;
//   } catch (error) {
//     console.error('Shop logout error:', error);
//     // Clear local storage even if API call fails
//     localStorage.removeItem('shopToken');
//     localStorage.removeItem('shop');
//     throw error;
//   }
// };

// export const logoutAdmin = async () => {
//   try {
//     const response = await authAxios.post('/admin/logout');
//     localStorage.removeItem('adminToken');
//     localStorage.removeItem('admin');
//     return response.data;
//   } catch (error) {
//     console.error('Admin logout error:', error);
//     // Clear local storage even if API call fails
//     localStorage.removeItem('adminToken');
//     localStorage.removeItem('admin');
//     throw error;
//   }
// };

// // Profile services
// export const getUserProfile = async () => {
//   try {
//     const response = await userAxios.get('/profile');
//     return response.data;
//   } catch (error) {
//     console.error('Get user profile error:', error);
//     throw error;
//   }
// };

// export const getShopProfile = async () => {
//   try {
//     const response = await authAxios.get('/shop/profile');
//     return response.data;
//   } catch (error) {
//     console.error('Get shop profile error:', error);
//     throw error;
//   }
// };

// // Token validation
// export const validateToken = async (tokenType: 'user' | 'shop' | 'admin') => {
//   try {
//     let endpoint = '';
//     switch (tokenType) {
//       case 'user':
//         endpoint = '/validate-token';
//         break;
//       case 'shop':
//         endpoint = '/shop/validate-token';
//         break;
//       case 'admin':
//         endpoint = '/admin/validate-token';
//         break;
//     }
    
//     const response = await authAxios.get(endpoint);
//     return response.data;
//   } catch (error) {
//     console.error(`${tokenType} token validation error:`, error);
//     throw error;
//   }
// };