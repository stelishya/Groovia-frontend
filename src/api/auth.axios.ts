import { createBaseAxios } from './base.axios.ts';

const AuthAxios = createBaseAxios('/auth/user');
export default AuthAxios;

export const AuthAxiosAdmin = createBaseAxios('/auth/admin');

export const UserAxios = createBaseAxios('/users');
