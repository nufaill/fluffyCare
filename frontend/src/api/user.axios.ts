// import { store } from '@/redux/store';
import axios from 'axios';
// import toast from 'react-hot-toast';

const userAxios = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL + '/user',
  withCredentials: true,
});

// let isRefreshing = false;
// userAxios.interceptors.response.use(
// 	(response) => response,
// 	async (error) => {
// 		console.log(error)
// 		const originalRequest = error.config;

// 		if (originalRequest.url === "/login") {
// 			return Promise.reject(error);
// 		}

// 		if (
// 			error.response?.status === 401 &&
// 			error.response.data.message === "Token Expired" &&
// 			!originalRequest._retry
// 		) {
// 			originalRequest._retry = true;
// 			if (!isRefreshing) {
// 				isRefreshing = true;
// 				try {
// 					await userAxios.post("/refresh-token");
// 					isRefreshing = false;
// 					return userAxios(originalRequest);
// 				} catch (refreshError) {
// 					isRefreshing = false;
// 					store.dispatch(customerLogout());
// 					window.location.href = "/login";
// 					toast("Please login again");
// 					return Promise.reject(refreshError);
// 				}
// 			}
// 		}
// 		if (
// 			error.response?.status === 403 &&
// 			error.response?.data?.message?.includes("Access denied") &&
// 			error.response?.data?.message?.includes("blocked")
// 		) {
// 			console.log("Caught blocked user response");
// 			store.dispatch(customerLogout());
// 			window.location.href = "/login";
// 			toast("Your account has been blocked. Please contact support.");
// 			return Promise.reject(error);
// 		}
// 		if (
// 			(error.response.status === 401 &&
// 				error.response.data.message === "Invalid token") ||
// 			(error.response.status === 403 &&
// 				error.response.data.message === "Token is blacklisted") ||
// 			(error.response.status === 403 &&
// 				error.response.data.message ===
// 				"Access denied: Your account has been blocked" &&
// 				!originalRequest._retry)
// 		) {
// 			console.log("Session ended");
// 			store.dispatch(customerLogout());

// 			window.location.href = "/login";
// 			toast("Please login again");
// 			return Promise.reject(error);
// 		}

// 		return Promise.reject(error);
// 	}
// );

export default userAxios;

