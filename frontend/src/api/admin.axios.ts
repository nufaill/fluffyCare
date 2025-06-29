import axios from 'axios';

const adminAxios = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL + "/admin" ,
  withCredentials: true,
});



export default adminAxios;
