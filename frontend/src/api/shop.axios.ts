import { store } from '@/redux/store';
import axios from 'axios';
import toast from 'react-hot-toast';

const shopAxios = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL + '/shop',
  withCredentials: true,
});



export default shopAxios;
