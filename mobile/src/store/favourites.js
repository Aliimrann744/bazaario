import { create } from 'zustand';
import { favourites as favApi } from '../api/endpoints';
import { useAuth } from './auth';

// Tracks which listing publicIds the current user has favourited, so the heart
// state stays consistent across Home, Search, Detail and the Favourites tab.
export const useFavourites = create((set, get) => ({
  ids: new Set(),
  items: [],
  loaded: false,

  load: async () => {
    if (!useAuth.getState().isAuthed()) {
      set({ ids: new Set(), items: [], loaded: true });
      return;
    }
    try {
      const { items } = await favApi.list();
      set({ items, ids: new Set(items.map((i) => i.publicId)), loaded: true });
    } catch (e) {
      set({ loaded: true });
    }
  },

  isFavourite: (publicId) => get().ids.has(publicId),

  // Optimistic toggle. Returns the new state (true = now favourited).
  toggle: async (listing) => {
    const publicId = listing.publicId;
    const ids = new Set(get().ids);
    const currentlyFav = ids.has(publicId);

    if (currentlyFav) {
      ids.delete(publicId);
      set({ ids, items: get().items.filter((i) => i.publicId !== publicId) });
      try {
        await favApi.remove(publicId);
      } catch (e) {
        ids.add(publicId);
        set({ ids: new Set(ids) });
      }
      return false;
    }

    ids.add(publicId);
    set({ ids, items: [listing, ...get().items.filter((i) => i.publicId !== publicId)] });
    try {
      await favApi.add(publicId);
    } catch (e) {
      ids.delete(publicId);
      set({ ids: new Set(ids), items: get().items.filter((i) => i.publicId !== publicId) });
    }
    return true;
  },

  reset: () => set({ ids: new Set(), items: [], loaded: false }),
}));

export default useFavourites;
