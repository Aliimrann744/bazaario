import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || Constants?.expoConfig?.extra?.apiUrl;
export const API_BASE_URL = BASE_URL;

const ACCESS_KEY = 'bazaario.accessToken';
const REFRESH_KEY = 'bazaario.refreshToken';

export const tokenStore = {
  async get() {
    const [access, refresh] = await Promise.all([AsyncStorage.getItem(ACCESS_KEY), AsyncStorage.getItem(REFRESH_KEY)]);
    return { access, refresh };
  },
  async set({ accessToken, refreshToken }) {
    const ops = [];
    if (accessToken !== undefined) ops.push(AsyncStorage.setItem(ACCESS_KEY, accessToken || ''));
    if (refreshToken !== undefined) ops.push(AsyncStorage.setItem(REFRESH_KEY, refreshToken || ''));
    await Promise.all(ops);
  },
  async clear() {
    await Promise.all([AsyncStorage.removeItem(ACCESS_KEY), AsyncStorage.removeItem(REFRESH_KEY)]);
  },
};

const api = axios.create({
  baseURL: `${BASE_URL}/v1`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the bearer token on every request.
api.interceptors.request.use(async (config) => {
  const access = await AsyncStorage.getItem(ACCESS_KEY);
  if (access) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// Transparent refresh: on a 401, try once to mint a new access token, then replay.
let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;

    if (status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem(REFRESH_KEY);
        if (!refreshToken) throw error;
        if (!refreshing) {
          refreshing = axios.post(`${BASE_URL}/v1/auth/refresh`, { refreshToken }).then((r) => r.data.accessToken).finally(() => {
              setTimeout(() => {
                refreshing = null;
              }, 0);
            });
        }
        const newAccess = await refreshing;
        await AsyncStorage.setItem(ACCESS_KEY, newAccess);
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (e) {
        await tokenStore.clear();
        return Promise.reject(normalizeError(error));
      }
    }
    return Promise.reject(normalizeError(error));
  }
);

// Convert an axios error into a friendly shape: { message, code, fields, status }.
export function normalizeError(error) {
  const apiErr = error?.response?.data?.error;
  if (apiErr) {
    return {
      message: apiErr.message || 'Something went wrong',
      code: apiErr.code,
      fields: apiErr.fields || null,
      status: error.response?.status,
    };
  }
  if (error?.message === 'Network Error' || error?.code === 'ERR_NETWORK') {
    return {
      message: "Can't reach the server. Check that the API is running and EXPO_PUBLIC_API_URL points to it.",
      code: 'NETWORK',
      status: 0,
    };
  }
  return { message: error?.message || 'Unexpected error', code: 'UNKNOWN', status: error?.response?.status };
}

export default api;