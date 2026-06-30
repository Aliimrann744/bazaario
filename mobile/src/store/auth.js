import { create } from 'zustand';
import { auth as authApi } from '../api/endpoints';
import { tokenStore } from '../api/client';

// Global auth store. Mirrors the web client's Zustand auth store.
export const useAuth = create((set, get) => ({
  user: null,
  status: 'loading', // 'loading' | 'authed' | 'guest'

  // Called once on app start to restore a session from stored tokens.
  bootstrap: async () => {
    try {
      const { access } = await tokenStore.get();
      if (!access) {
        set({ status: 'guest', user: null });
        return;
      }
      const { user } = await authApi.me();
      set({ user, status: 'authed' });
    } catch (e) {
      await tokenStore.clear();
      set({ status: 'guest', user: null });
    }
  },

  login: async (emailOrPhone, password) => {
    const { user, accessToken, refreshToken } = await authApi.login(emailOrPhone, password);
    await tokenStore.set({ accessToken, refreshToken });
    set({ user, status: 'authed' });
    return user;
  },

  register: async (payload) => {
    const { user, accessToken, refreshToken } = await authApi.register(payload);
    await tokenStore.set({ accessToken, refreshToken });
    set({ user, status: 'authed' });
    return user;
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // best-effort; tokens are stateless
    }
    await tokenStore.clear();
    set({ user: null, status: 'guest' });
  },

  updateProfile: async (patch) => {
    const { user } = await authApi.updateProfile(patch);
    set({ user });
    return user;
  },

  setUser: (user) => set({ user }),

  isAuthed: () => get().status === 'authed',
}));

export default useAuth;
