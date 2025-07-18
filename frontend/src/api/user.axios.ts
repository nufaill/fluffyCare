import { logoutUser } from '@/redux/slices/user.slice';
import { store } from '@/redux/store';
import axios from 'axios';
import toast from 'react-hot-toast';
import Authaxios from './auth.axios';
import { handleAxiosError } from './errorHandler';

const Useraxios = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL + '/user',
  withCredentials: true,
});

Useraxios.interceptors.response.use(
  (response) => response,
  (error) => handleAxiosError(error)
);

let isRefreshing = false;

Useraxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log(error);
    const originalRequest = error.config;

    if (originalRequest.url === '/login') {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      error.response.data.message === 'Token Expired' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await Authaxios.post('/refresh-token');
          isRefreshing = false;
          return Useraxios(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          store.dispatch(logoutUser());
          window.location.href = '/login';
          toast('Please login again');
          return Promise.reject(refreshError);
        }
      }
    }
    if (
      error.response?.status === 403 &&
      error.response?.data?.message?.includes('Access denied') &&
      error.response?.data?.message?.includes('blocked')
    ) {
      console.log('Caught blocked user response');
      store.dispatch(logoutUser());
      window.location.href = '/login';
      toast('Your account has been blocked. Please contact support.');
      return Promise.reject(error);
    }
    if (
      (error.response.status === 401 &&
        error.response.data.message === 'Invalid token') ||
      (error.response.status === 403 &&
        error.response.data.message === 'Token is blacklisted') ||
      (error.response.status === 403 &&
        error.response.data.message === 'Access denied: Your account has been blocked' &&
        !originalRequest._retry)
    ) {
      console.log('Session ended');
      store.dispatch(logoutUser());
      window.location.href = '/login';
      toast('Please login again');
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default Useraxios;