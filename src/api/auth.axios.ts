import { createBaseAxios } from './base.axios.ts';

const AuthAxios = createBaseAxios('/auth/user');
console.log("HI from AuthAxios in auth.axios.ts:",AuthAxios)
export default AuthAxios;