// import axios from 'axios';

// const authAxios = axios.create({
//    baseURL: import.meta.env.VITE_SERVER_URL + '/user',
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor to add auth token
// authAxios.interceptors.request.use(
//   (config) => {
//     // Get token based on the endpoint
//     let token = null;
    
//     if (config.url?.includes('/user/') || config.url?.includes('/signup')) {
//       token = localStorage.getItem('userToken');
//     } else if (config.url?.includes('/shop/')) {
//       token = localStorage.getItem('shopToken');
//     } else if (config.url?.includes('/admin/')) {
//       token = localStorage.getItem('adminToken');
//     }

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor to handle auth errors
// authAxios.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (error.response?.status === 401) {
//       // Token expired or invalid
//       const currentPath = window.location.pathname;
      
//       if (currentPath.includes('/shop/')) {
//         localStorage.removeItem('shopToken');
//         localStorage.removeItem('shop');
//         window.location.href = '/shop/login';
//       } else if (currentPath.includes('/admin/')) {
//         localStorage.removeItem('adminToken');
//         localStorage.removeItem('admin');
//         window.location.href = '/admin/login';
//       } else {
//         localStorage.removeItem('userToken');
//         localStorage.removeItem('user');
//         window.location.href = '/login';
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default authAxios;