// src/api/auth.axios.ts
import axios from "axios";

export const authAxios = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL + '/user',
  withCredentials: true, 
});
