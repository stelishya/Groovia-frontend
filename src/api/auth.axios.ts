import { createBaseAxios } from './base.axios.ts';

const AuthAxios = createBaseAxios('/auth/user');
console.log("HI from AuthAxios in auth.axios.ts:",AuthAxios)
export default AuthAxios;

export const AuthAxiosAdmin = createBaseAxios('/auth/admin');
console.log("HI from AuthAxiosAdmin in auth.axios.ts:",AuthAxiosAdmin)

export const UserAxios = createBaseAxios('/users');
console.log("HI from UserAxios in auth.axios.ts:",UserAxios)
