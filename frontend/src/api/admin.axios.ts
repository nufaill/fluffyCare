import axios from 'axios';

const AdminAxios = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL + "/admin" ,
  withCredentials: true,
});



export default AdminAxios;
