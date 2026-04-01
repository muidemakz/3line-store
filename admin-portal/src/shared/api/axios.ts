import axios from 'axios';
import { applyInterceptors } from '@/shared/api/interceptors';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://dummyjson.com',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

applyInterceptors(axiosInstance);
