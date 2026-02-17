import { create } from 'zustand';
import { searchExternalRecipes } from '../lib/externalRecipesApi';

export const useExternalRecipesStore = create((set, get) => ({
  items: [],
  count: 0,
  q: '',
  isLoading: false,
  error: null,

  _controller: null,

  clear: () => {
    const c = get()._controller;
    if (c) {
      try {
        c.abort();
      } catch {}
    }
    set({
      items: [],
      count: 0,
      q: '',
      isLoading: false,
      error: null,
      _controller: null,
    });
  },

  search: async (q) => {
    const query = String(q || '').trim();

    if (!query) {
      get().clear();
      return;
    }

    const prev = get()._controller;
    if (prev) {
      try {
        prev.abort();
      } catch {}
    }

    const controller = new AbortController();
    set({ isLoading: true, error: null, q: query, _controller: controller });

    try {
      const data = await searchExternalRecipes(query, controller.signal);

      set({
        items: data?.items || [],
        count: Number(data?.count || 0),
        isLoading: false,
        error: null,
        _controller: null,
      });
    } catch (e) {
      if (e?.name === 'AbortError') return;

      set({
        isLoading: false,
        error: e?.message || 'Failed to load external recipes.',
        _controller: null,
      });
    }
  },
}));
