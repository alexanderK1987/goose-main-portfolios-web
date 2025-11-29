import axios from 'axios';
import router from '@/router';
import siteConfig from '@/../.siteConfig';

// --- 1. Axios Instance Configuration ---
const api = axios.create({
  baseURL: siteConfig.gooseApiUrl,
  timeout: siteConfig.axiosTimeout,
});

// --- 2. Refresh Token Logic Variables ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// --- 3. Request Interceptor (Add Access Token) ---
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem(siteConfig.tokenStorageKey);
    const newConfig = { ...config };
    if (token) {
      newConfig.headers = {
        ...newConfig.headers, // Preserve existing headers
        Authorization: `Bearer ${token}`,
      };
    }

    return newConfig;
  },
  error => Promise.reject(error),
);

// --- 4. Response Interceptor (Handle 401 & Refresh) ---
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Check if the error is 401 and it hasn't been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // A. Handle concurrent refresh attempts (Queue the request)
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;

            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      // B. Start refresh process
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(siteConfig.refreshTokenStorageKey);
      const REFRESH_URL = `${siteConfig.gooseApiUrl}${siteConfig.endpoints.userRefresh}`;

      // If no refresh token exists, immediately redirect to login
      if (!refreshToken) {
        isRefreshing = false;
        router.push('/login');

        return Promise.reject(error);
      }

      try {
        // Attempt to refresh
        const rs = await axios.post(REFRESH_URL, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = rs.data;

        // Update tokens in storage
        localStorage.setItem(siteConfig.tokenStorageKey, access_token);
        if (newRefreshToken) {
          localStorage.setItem(siteConfig.refreshTokenStorageKey, newRefreshToken);
        }

        // Update original request header and retry it
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        processQueue(null, access_token);

        return api(originalRequest);
      } catch (_error) {
        // Refresh failed: Clear all tokens and redirect
        localStorage.removeItem(siteConfig.tokenStorageKey);
        localStorage.removeItem(siteConfig.refreshTokenStorageKey);
        processQueue(_error, null);
        router.push('/login');

        return Promise.reject(_error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// --- 5. Plugin Export ---
export default {
  install(Vue) {
    // Expose the configured API instance as $api on all Vue components
    Vue.prototype.$api = api;
  },
};
