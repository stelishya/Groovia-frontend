import axios, { type AxiosInstance } from 'axios';
import { handleAxiosError } from './errorHandler';

export const createBaseAxios = (basePath: string): AxiosInstance => {
  console.log("HI!! from base axios in base.axios.ts")
  console.log("basePath:", basePath)
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
      
      // Store axios instance reference for retry mechanism
      (config as any).__axiosInstance = instance;
      
      console.log("token in base axios:", token)
      console.log("config in base axios:", config)
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