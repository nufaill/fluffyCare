import { createBaseAxios } from './base.axios';
import { addTokenRefreshInterceptor } from './tokenRefreshHandler';

const UserAxios = createBaseAxios('/user');
addTokenRefreshInterceptor(UserAxios, false, '/login');

export default UserAxios;