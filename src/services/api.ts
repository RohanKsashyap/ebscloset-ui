import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ramsons-software-backend.onrender.com/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let backendOk = true;
let lastCheck = 0;
const HEALTH_PATH = '/health';
const CHECK_TTL_MS = 30000;

export async function ensureBackendAvailable(): Promise<boolean> {
  const now = Date.now();
  if (now - lastCheck < CHECK_TTL_MS) return backendOk;
  lastCheck = now;
  try {
    await axios.get(API_BASE_URL.replace(/\/$/, '') + HEALTH_PATH, { timeout: 1500 });
    backendOk = true;
  } catch {
    backendOk = false;
  }
  return backendOk;
}

export function isBackendAvailable(): boolean {
  return backendOk;
}

apiClient.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('token');
  const token = adminToken || userToken;
  
  if (token) {
    if (config.headers && 'set' in config.headers) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      (config.headers as Record<string, string>) = (config.headers as Record<string, string>) || {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
