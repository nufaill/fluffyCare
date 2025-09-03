import { createBaseAxios } from './base.axios';
import { addTokenRefreshInterceptor } from './tokenRefreshHandler';

const ShopAxios = createBaseAxios('/shop');
addTokenRefreshInterceptor(ShopAxios, true, '/shop/login');

export default ShopAxios;