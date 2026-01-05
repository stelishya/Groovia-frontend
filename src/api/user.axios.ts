import { createBaseAxios } from './base.axios.ts';

export const AdminAxios = createBaseAxios('/admins');
export const UserAxios = createBaseAxios('/users');

export const DancerAxios = createBaseAxios('/dancers');

export const ClientAxios = createBaseAxios('/clients');

export const WorkshopAxios = createBaseAxios('/workshops');

export const NotificationAxios = createBaseAxios('/notifications');

export const VideoCallAxios = createBaseAxios('/video-calls');

export const CompetitionAxios = createBaseAxios('/competitions');
