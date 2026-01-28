import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { refreshToken } from '../services/user/auth.service';
import { store } from '../redux/store';
import { logoutUser } from '../redux/slices/user.slice';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: string | null) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const handleAxiosError = async (error: AxiosError) => {
  const originalRequest = error.config as CustomAxiosRequestConfig;

  if (!error.response) {
    return Promise.reject(error);
  }
  console.log("error.response", error.response)
  const { status, data } = error.response;

  interface ApiErrorData {
    message?: string;
    isAccessTokenExpired?: boolean;
    isRefreshTokenExpired?: boolean;
    isUserBlocked?: boolean;
  }

  const errorData = data as ApiErrorData;
  const message = errorData?.message || 'An unexpected error occurred';
  const isAccessTokenExpired = errorData?.isAccessTokenExpired;
  const isRefreshTokenExpired = errorData?.isRefreshTokenExpired;
  const isUserBlocked = errorData?.isUserBlocked;

  // Handle blocked user
  if (status === 401 && (isUserBlocked || message === 'User account is blocked')) {
    toast.error('Your account has been blocked. Please contact support.');
    // Update Redux immediately so guards react without waiting for navigation
    try { store.dispatch(logoutUser()); } catch { }
    // Clear persisted tokens
    localStorage.removeItem('token');
    localStorage.removeItem('userDatas');
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1200);
    return Promise.reject(error);
  }

  // Handle token expiration with automatic refresh
  if (status === 401 && isAccessTokenExpired && !originalRequest._retry) {
    if (isRefreshing) {
      // If already refreshing, queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          const axiosInstance = (error.config as CustomAxiosRequestConfig & { __axiosInstance?: unknown }).__axiosInstance;
          if (axiosInstance && typeof axiosInstance === 'object' && 'request' in axiosInstance) {
            return (axiosInstance as { request: (config: CustomAxiosRequestConfig) => Promise<unknown> }).request(originalRequest);
          }
          return Promise.reject(new Error('Axios instance not available'));
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { accessToken } = await refreshToken();

      // Update token in localStorage
      localStorage.setItem('token', accessToken);

      // Update the failed request with new token
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      // Process queued requests
      processQueue(null, accessToken);
      isRefreshing = false;

      // Retry the original request
      const axiosInstance = (error.config as CustomAxiosRequestConfig & { __axiosInstance?: unknown }).__axiosInstance;
      if (axiosInstance && typeof axiosInstance === 'object' && 'request' in axiosInstance) {
        return (axiosInstance as { request: (config: CustomAxiosRequestConfig) => Promise<unknown> }).request(originalRequest);
      }
      return Promise.reject(new Error('Axios instance not available'));
    } catch (refreshError) {
      processQueue(refreshError, null);
      isRefreshing = false;

      // If refresh fails, clear session and redirect to login
      toast.error('Your session has expired. Please login again.');
      try { store.dispatch(logoutUser()); } catch { }
      localStorage.removeItem('token');
      localStorage.removeItem('userDatas');
      localStorage.removeItem('userToken');
      localStorage.removeItem('user');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);

      return Promise.reject(refreshError);
    }
  }

  // Handle refresh token expiration
  if (status === 401 && isRefreshTokenExpired) {
    toast.error('Your session has expired. Please login again.');
    try { store.dispatch(logoutUser()); } catch { }
    localStorage.removeItem('token');
    localStorage.removeItem('userDatas');
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
    return Promise.reject(error);
  }

  if (status === 401 && message === 'invalid password') {
    // toast.error(message);
    return Promise.reject(error);
  }
  if (message == "Email already exists" || message == "Username already exists") {
    return Promise.reject(error);
  }

  // Skip toasting for errors handled by token refresh logic
  if (
    status === 401 ||
    status === 403 ||
    message.includes('Token Expired') ||
    message.includes('Invalid token') ||
    message.includes('Token is blacklisted') ||
    message.includes('Access denied')
  ) {
    return Promise.reject(error);
  }

  switch (status) {
    case 400:
      toast.error(`Bad request: ${message}`);
      break;
    case 429:
      toast.error('Too many requests: Please try again later.');
      break;
    case 500:
      toast.error('Server error: Please try again later.');
      break;
    default:
      toast.error(`Error: ${message}`);
      break;
  }

  return Promise.reject(error);
};