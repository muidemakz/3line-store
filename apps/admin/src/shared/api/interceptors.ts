import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { notifyError } from '@/shared/lib/toast';

function handleRequest(config: InternalAxiosRequestConfig) {
  const token = localStorage.getItem('auth_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}

function handleRequestError(error: AxiosError) {
  return Promise.reject(error);
}

function handleResponseError(error: AxiosError<{ message?: string }>) {
  const message = error.response?.data?.message ?? error.message ?? 'Something went wrong';

  if (error.response?.status && error.response.status >= 500) {
    notifyError(message);
  }

  return Promise.reject(error);
}

export function applyInterceptors(instance: AxiosInstance) {
  instance.interceptors.request.use(handleRequest, handleRequestError);
  instance.interceptors.response.use((response) => response, handleResponseError);
}
