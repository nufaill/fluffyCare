import { createBaseAxios } from './base.axios';

const AuthAxios = createBaseAxios('/auth');
export default AuthAxios;