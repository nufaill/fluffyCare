import axios from 'axios';
import { handleAxiosError } from './errorHandler';

const MessageAxios = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL + "/messages" ,
  withCredentials: true,
});

MessageAxios.interceptors.response.use(
  (response) => response,
  (error) => handleAxiosError(error)
);


export default MessageAxios;
