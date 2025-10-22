import { createBaseAxios } from './base.axios.ts';

export const DancerAxios = createBaseAxios('/dancers');

export const ClientAxios = createBaseAxios('/clients');