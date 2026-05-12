import axios from 'axios';
import { applyInterceptors } from '@/shared/api/interceptors';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

applyInterceptors(axiosInstance);
