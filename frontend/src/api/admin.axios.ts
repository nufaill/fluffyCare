import { createBaseAxios } from './base.axios';

const AdminAxios = createBaseAxios('/admin');
export default AdminAxios;