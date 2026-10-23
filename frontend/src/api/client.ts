import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 45 s timeout — handles Render free tier container cold-wake cleanly without premature ECONNABORTED
  timeout: 45000,
});

// Request interceptor — attach JWT token + extend timeout for auth endpoints (BCrypt is CPU-heavy)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Auth endpoints (login / register) may take up to 25 s on Render free tier
    if (config.url?.includes('/auth/')) {
      config.timeout = 30000;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor — retry GETs on cold-start errors; clear token on 401 only for protected routes
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const url = (error.config as InternalAxiosRequestConfig)?.url ?? '';

    if (error.response?.status === 401 && !url.includes('/auth/')) {
      // Clear stale token only when a protected route rejects it, not on login/register itself
      localStorage.removeItem('token');
      return Promise.reject(error);
    }

    // Auto-retry for cold starts on free servers (Render/Railway/etc) — GET requests only
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };
    if (
      config &&
      config.method?.toUpperCase() === 'GET' &&
      (!error.response || [502, 503, 504].includes(error.response.status))
    ) {
      config._retryCount = config._retryCount || 0;
      if (config._retryCount < 2) {
        config._retryCount += 1;
        // Wait 1.5 s before retrying cold start
        await new Promise((resolve) => setTimeout(resolve, 1500 * config._retryCount!));
        return apiClient(config);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
