import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { handleAxiosError } from './errorHandler';

export const createBaseAxios = (basePath: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: `${import.meta.env.VITE_SERVER_URL}${basePath}`,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => handleAxiosError(error)
  );

  return instance;
};