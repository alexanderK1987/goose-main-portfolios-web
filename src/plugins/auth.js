import axios from 'axios';
import siteConfig from '@/../.siteConfig';

const api = axios.create({
  baseURL: siteConfig.gooseApiUrl,
  timeout: siteConfig.axiosTimeout,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem(siteConfig.localStorageKeys.auth.tokenStorageKey);
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

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Check for Unauthorized/Forbidden status and ensure we aren't already retrying
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
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

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(siteConfig.localStorageKeys.auth.refreshTokenStorageKey);
      const REFRESH_URL = `${siteConfig.gooseApiUrl}${siteConfig.endpoints.userRefresh}`;

      const redirectToLogin = () => {
        window.location.href = siteConfig.loginPageUrl;
      };

      if (!refreshToken) {
        isRefreshing = false;
        redirectToLogin();

        return Promise.reject(error);
      }

      try {
        const rs = await axios.post(REFRESH_URL, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = rs.data;

        // Update tokens in storage
        localStorage.setItem(siteConfig.localStorageKeys.auth.tokenStorageKey, access_token);
        if (newRefreshToken) {
          localStorage.setItem(siteConfig.localStorageKeys.auth.refreshTokenStorageKey, newRefreshToken);
        }

        // Update original request header and retry it
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        processQueue(null, access_token);

        return api(originalRequest);
      } catch (_error) {
        // Refresh failed: Clear all tokens and notify queue
        localStorage.removeItem(siteConfig.localStorageKeys.auth.tokenStorageKey);
        localStorage.removeItem(siteConfig.localStorageKeys.auth.refreshTokenStorageKey);

        processQueue(_error, null);
        redirectToLogin();

        return Promise.reject(_error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default {
  install(Vue) {
    Vue.prototype.$api = api;
  },
};
