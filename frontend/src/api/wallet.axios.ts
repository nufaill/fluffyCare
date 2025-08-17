import axios from 'axios';
import { handleAxiosError } from './errorHandler';

const Walletaxios = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL + '/wallet',
  withCredentials: true, // This is crucial for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (optional, for debugging)
Walletaxios.interceptors.request.use(
  (config) => {
    console.log('Wallet API Request:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      withCredentials: config.withCredentials,
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
Walletaxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Wallet API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
    });
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.error('Wallet authentication failed - check if shop is logged in');
      // Optionally redirect to login page
      // window.location.href = '/shop/login';
    }
    
    return Promise.reject(handleAxiosError ? handleAxiosError(error) : error);
  }
);

export default Walletaxios;