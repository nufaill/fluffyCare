import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const handleAxiosError = (error: AxiosError) => {
  if ((error.config as CustomAxiosRequestConfig)?._retry) {
    return Promise.reject(error);
  }

  if (!error.response) {
    // toast.error('Network error: Please check your internet connection.');
    return Promise.reject(error);
  }

  const { status, data } = error.response;
  const message = (data as any)?.message || 'An unexpected error occurred';

  // Skip toasting for errors handled by token refresh logic
  if (
    status === 401 ||
    status === 403 ||
    message.includes('Token Expired') ||
    message.includes('Invalid token') ||
    message.includes('Token is blacklisted') ||
    message.includes('Access denied')
  ) {
    return Promise.reject(error);
  }

  switch (status) {
    case 400:
      toast.error(`Bad request: ${message}`);
      break;
    case 429:
      toast.error('Too many requests: Please try again later.');
      break;
    case 500:
      toast.error('Server error: Please try again later.');
      break;
    default:
      // toast.error(`Error: ${message}`);
      break;
  }

  return Promise.reject(error);
};