import { create } from 'zustand';
import api, { setTokens, clearTokens, apiError } from '../lib/api';

export const useAuth = create((set, get) => ({
  user: null,
  ready: false,

  // Restore session on app load
  init: async () => {
    if (!localStorage.getItem('bz_access')) { set({ ready: true }); return; }
    try {
      const { data } = await api.get('/me');
      set({ user: data.user, ready: true });
    } catch {
      clearTokens();
      set({ user: null, ready: true });
    }
  },

  login: async (emailOrPhone, password) => {
    const { data } = await api.post('/auth/login', { emailOrPhone, password });
    setTokens(data.accessToken, data.refreshToken);
    set({ user: data.user });
    return data.user;
  },

  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setTokens(data.accessToken, data.refreshToken);
    set({ user: data.user });
    return data.user;
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    clearTokens();
    set({ user: null });
  },

  updateUser: (patch) => set({ user: { ...get().user, ...patch } }),
}));

export { apiError };
