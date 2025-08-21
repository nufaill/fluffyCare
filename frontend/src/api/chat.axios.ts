import axios from 'axios';
import { handleAxiosError } from './errorHandler';

const ChatAxios = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL + "/chats" ,
  withCredentials: true,
});

ChatAxios.interceptors.response.use(
  (response) => response,
  (error) => handleAxiosError(error)
);


export default ChatAxios;
