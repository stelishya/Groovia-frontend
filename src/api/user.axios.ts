import { createBaseAxios } from './base.axios.ts';

export const AdminAxios = createBaseAxios('/admins');

export const DancerAxios = createBaseAxios('/dancers');

export const ClientAxios = createBaseAxios('/clients');

export const WorkshopAxios = createBaseAxios('/workshops');

export const NotificationAxios = createBaseAxios('/notifications');

export const CompetitionAxios = createBaseAxios('/competitions');
