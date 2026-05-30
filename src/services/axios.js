import axios from 'axios';

/**
 * Resolves API base URL with correct protocol:
 * - localhost / 127.0.0.1 → http (local Node has no TLS)
 * - production hosts → https
 */
export const getApiBaseUrl = () => {
  const explicit = import.meta.env.VITE_API_URL?.trim();
  if (explicit) {
    const normalized = explicit.replace(/\/$/, '');
    return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
  }

  let host = (import.meta.env.VITE_BACKEND || 'localhost:3000').trim();
  host = host.replace(/^https?:\/\//, '').replace(/\/$/, '');

  const isLocal =
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1') ||
    host === '0.0.0.0';

  const protocol = isLocal ? 'http' : 'https';
  return `${protocol}://${host}/api`;
};

/** Build a full URL for legacy fetch/axios calls: apiUrl('/getallMines') */
export const apiUrl = (path = '') => {
  const base = getApiBaseUrl();
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isSessionCheck = error.config?.url?.includes('/auth/me');
    if (error.response?.status === 401 && !isSessionCheck) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const isAuthPage = ['/login', '/signup'].some((p) =>
        window.location.pathname.toLowerCase().includes(p)
      );
      if (!isAuthPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
