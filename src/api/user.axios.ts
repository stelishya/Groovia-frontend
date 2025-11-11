import { createBaseAxios } from './base.axios.ts';

export const AdminAxios = createBaseAxios('/admins');
console.log("HI from AdminAxios in user.axios.ts:",AdminAxios)

export const DancerAxios = createBaseAxios('/dancers');

export const ClientAxios = createBaseAxios('/clients');

export const NotificationAxios = createBaseAxios('/notifications');
console.log("HI from NotificationAxios in user.axios.ts:",NotificationAxios)