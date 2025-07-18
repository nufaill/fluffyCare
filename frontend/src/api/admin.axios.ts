import axios from 'axios';
import { handleAxiosError } from './errorHandler';

const AdminAxios = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL + "/admin" ,
  withCredentials: true,
});

AdminAxios.interceptors.response.use(
  (response) => response,
  (error) => handleAxiosError(error)
);


export default AdminAxios;
