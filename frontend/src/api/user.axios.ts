// src/api/user.axios.ts
import axios from "axios";

const Useraxios = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL + '/user',
  withCredentials: true, 
});

export default Useraxios;
