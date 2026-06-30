import { create } from 'zustand';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from './auth';

export const useFavourites = create((set, get) => ({
  ids: new Set(),

  hydrate: async () => {
    if (!useAuth.getState().user) { set({ ids: new Set() }); return; }
    try {
      const { data } = await api.get('/favourites');
      set({ ids: new Set(data.items.map((i) => i.publicId)) });
    } catch { /* ignore */ }
  },

  isFav: (publicId) => get().ids.has(publicId),

  toggle: async (publicId) => {
    const user = useAuth.getState().user;
    if (!user) { toast('Log in to save listings ❤️'); return; }
    const ids = new Set(get().ids);
    const has = ids.has(publicId);
    // optimistic
    if (has) ids.delete(publicId); else ids.add(publicId);
    set({ ids });
    try {
      if (has) await api.delete(`/listings/${publicId}/favourite`);
      else { await api.post(`/listings/${publicId}/favourite`); toast.success('Saved to favourites'); }
    } catch {
      // revert
      const r = new Set(get().ids);
      if (has) r.add(publicId); else r.delete(publicId);
      set({ ids: r });
      toast.error('Could not update favourite');
    }
  },

  clear: () => set({ ids: new Set() }),
}));
