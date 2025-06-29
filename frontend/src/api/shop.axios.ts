import axios from 'axios';

const shopAxios = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL + "/shop" ,
  withCredentials: true,
});



export default shopAxios;
