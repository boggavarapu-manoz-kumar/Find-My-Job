import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to automatically attach JWT token if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor with graceful retry for free server cold starts
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token if expired or invalid
      localStorage.removeItem('token');
      return Promise.reject(error);
    }

    // Auto-retry for cold starts on free servers (Render/Railway/etc) for idempotent GET requests
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };
    if (
      config &&
      config.method?.toUpperCase() === 'GET' &&
      (!error.response || [502, 503, 504].includes(error.response.status))
    ) {
      config._retryCount = config._retryCount || 0;
      if (config._retryCount < 2) {
        config._retryCount += 1;
        // Wait 1.5s before retrying cold start
        await new Promise((resolve) => setTimeout(resolve, 1500 * config._retryCount!));
        return apiClient(config);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
