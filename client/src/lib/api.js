import axios from 'axios';

// Use the dev proxy (/api) unless an absolute URL is configured.
const baseURL = (import.meta.env.VITE_API_URL || '/api') + '/v1';

// ngrok's free tier serves a browser "warning" interstitial page (with NO CORS
// headers) for browser-looking requests. Sending this header on every request
// tells ngrok to skip it and forward straight to our API, so the browser gets
// our real (CORS-enabled) response instead of a headerless HTML page.
const defaultHeaders = { 'ngrok-skip-browser-warning': 'true' };

const api = axios.create({ baseURL, timeout: 20000, headers: defaultHeaders });

let accessToken = localStorage.getItem('bz_access') || null;
let refreshToken = localStorage.getItem('bz_refresh') || null;

export function setTokens(access, refresh) {
  accessToken = access || null;
  refreshToken = refresh ?? refreshToken;
  if (access) localStorage.setItem('bz_access', access);
  else localStorage.removeItem('bz_access');
  if (refresh) localStorage.setItem('bz_refresh', refresh);
}

export function clearTokens() {
  accessToken = null; refreshToken = null;
  localStorage.removeItem('bz_access');
  localStorage.removeItem('bz_refresh');
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Transparent refresh on 401 (once per request).
let refreshing = null;
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && refreshToken && !original._retry) {
      original._retry = true;
      try {
        refreshing = refreshing || axios.post(`${baseURL}/auth/refresh`, { refreshToken }, { headers: defaultHeaders });
        const { data } = await refreshing;
        refreshing = null;
        setTokens(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (e) {
        refreshing = null;
        clearTokens();
      }
    }
    return Promise.reject(error);
  }
);

// Helper to surface a readable message from our error envelope.
export function apiError(err, fallback = 'Something went wrong') {
  return err?.response?.data?.error?.message || fallback;
}
export function apiFields(err) {
  return err?.response?.data?.error?.fields || null;
}

export default api;
