import axios from 'axios';

const ACCESS_TOKEN_KEY = 'sfo_access_token';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token) {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function clearSession() {
  setAccessToken(null);
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const isRefreshRoute = typeof originalRequest.url === 'string' && originalRequest.url.includes('/auth/refresh-token');
    const isAuthRoute =
      typeof originalRequest.url === 'string' &&
      (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/register'));

    if (status !== 401 || originalRequest._retry || isRefreshRoute || isAuthRoute) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshResponse = await refreshClient.post('/auth/refresh-token');
      const newAccessToken = refreshResponse.data?.data?.accessToken;

      if (!newAccessToken) {
        throw error;
      }

      setAccessToken(newAccessToken);
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearSession();
      window.dispatchEvent(new Event('auth:session-expired'));
      return Promise.reject(refreshError);
    }
  }
);

export default api;