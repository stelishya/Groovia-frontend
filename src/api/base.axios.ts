import axios, { type AxiosInstance } from 'axios';
import { handleAxiosError } from './errorHandler.ts';

export const createBaseAxios = (basePath: string): AxiosInstance => {
  console.log("HI!! from base axios in base.axios.ts")
  console.log("basePath:", basePath)
  const instance = axios.create({
    baseURL: `${import.meta.env.VITE_SERVER_URL}${basePath}`,
    // baseURL: `http://localhost:5000${basePath}`,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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