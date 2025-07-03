// src/api/auth.axios.ts
import axios from "axios";

const Authaxios = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL + '/auth',
  withCredentials: true, 
});

export default Authaxios;
