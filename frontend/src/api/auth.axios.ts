// src/api/auth.axios.ts
import axios from "axios";
import { handleAxiosError } from "./errorHandler";

const Authaxios = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL + '/auth',
  withCredentials: true, 
});

Authaxios.interceptors.response.use(
  (response) => response,
  (error) => handleAxiosError(error)
);

export default Authaxios;
