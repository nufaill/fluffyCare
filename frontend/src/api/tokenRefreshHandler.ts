import { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { store } from '@/redux/store';
import { logoutShop } from '@/redux/slices/shop.slice';
import { logoutUser } from '@/redux/slices/user.slice';
import toast from 'react-hot-toast';
import AuthAxios from './auth.axios';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

export const addTokenRefreshInterceptor = (
    instance: AxiosInstance,
    isShop: boolean,
    loginPath: string
) => {
    let isRefreshing = false;

    instance.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const originalRequest = error.config as CustomAxiosRequestConfig;

            if (originalRequest.url?.includes('login')) {
                return Promise.reject(error);
            }

            if (
                error.response?.status === 401 &&
                (error.response.data as any)?.message === 'Token Expired' &&
                !originalRequest._retry
            ) {
                originalRequest._retry = true;
                if (!isRefreshing) {
                    isRefreshing = true;
                    try {
                        await AuthAxios.post('/refresh-token');
                        isRefreshing = false;
                        return instance(originalRequest);
                    } catch (refreshError) {
                        isRefreshing = false;
                        store.dispatch(isShop ? logoutShop() : logoutUser());
                        window.location.href = loginPath;
                        toast('Please login again');
                        return Promise.reject(refreshError);
                    }
                }
            }

            if (
                error.response?.status === 403 &&
                (error.response.data as any)?.message?.includes('Access denied') &&
                (error.response.data as any)?.message?.includes('blocked')
            ) {
                console.log('Caught blocked user response');
                store.dispatch(isShop ? logoutShop() : logoutUser());
                window.location.href = loginPath;
                toast('Your account has been blocked. Please contact support.');
                return Promise.reject(error);
            }

            if (
                (error.response?.status === 401 && (error.response.data as any)?.message === 'Invalid token') ||
                (error.response?.status === 403 &&
                    ((error.response.data as any)?.message === 'Token is blacklisted' ||
                        (error.response.data as any)?.message === 'Access denied: Your account has been blocked' && !originalRequest._retry))
            ) {
                console.log('Session ended');
                store.dispatch(isShop ? logoutShop() : logoutUser());
                window.location.href = loginPath;
                toast('Please login again');
                return Promise.reject(error);
            }

            return Promise.reject(error);
        }
    );
};