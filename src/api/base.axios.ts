import axios, { type AxiosInstance } from 'axios';
import { handleAxiosError } from './errorHandler';

export const createBaseAxios = (basePath: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: `${import.meta.env.VITE_SERVER_URL}${basePath}`,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      const skipAuth = config.url?.endsWith('/login') || config.url?.includes('/auth/common/google') || config.url?.includes('/refresh-token');

      if (token && !skipAuth) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Optionally, decode token and check role in frontend logic if needed
      // Example:
      // import { decodeJwt } from '../utils/auth';
      // const payload = decodeJwt(token);
      // if (payload?.role && !payload.role.includes('admin')) {
      //   // Optionally block or redirect if not admin
      // }

      (config as any).__axiosInstance = instance;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => handleAxiosError(error)
  );

  return instance;
};