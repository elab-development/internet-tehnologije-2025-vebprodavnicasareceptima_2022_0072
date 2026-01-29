import { create } from 'zustand';
import { apiFetch } from '../lib/api';

const msg = (e, fallback) => e?.message || fallback;

export const useRecipeIngredientsStore = create((set, get) => ({
  items: [],
  item: null,

  isLoading: false,
  error: null,
  success: null,

  recipeId: '',
  count: 0,

  setRecipeId: (recipeId) => set({ recipeId }),
  clearMessages: () => set({ error: null, success: null }),
  clearItem: () => set({ item: null }),

  fetchByRecipeId: async (recipeId) => {
    const rid = recipeId ?? get().recipeId;
    if (!rid) {
      set({ items: [], count: 0 });
      return [];
    }

    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch(
        `/api/recipe-ingredients?recipeId=${encodeURIComponent(rid)}`,
      );
      set({
        items: data.items || [],
        count: data.count ?? 0,
        recipeId: rid,
        isLoading: false,
      });
      return data.items || [];
    } catch (e) {
      set({
        isLoading: false,
        error: msg(e, 'Failed to fetch recipe ingredients.'),
      });
      return [];
    }
  },

  fetchOne: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch(`/api/recipe-ingredients/${id}`);
      set({ item: data.item, isLoading: false });
      return data.item;
    } catch (e) {
      set({
        isLoading: false,
        error: msg(e, 'Failed to fetch recipe ingredient.'),
      });
      return null;
    }
  },

  update: async (id, patch) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const data = await apiFetch(`/api/recipe-ingredients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      });
      set({
        isLoading: false,
        success: data.message || 'Recipe ingredient updated.',
      });

      const rid = get().recipeId;
      if (rid) await get().fetchByRecipeId(rid);

      return true;
    } catch (e) {
      set({
        isLoading: false,
        error: msg(e, 'Failed to update recipe ingredient.'),
      });
      throw e;
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const data = await apiFetch(`/api/recipe-ingredients/${id}`, {
        method: 'DELETE',
      });
      set({
        isLoading: false,
        success: data.message || 'Recipe ingredient deleted.',
      });

      const rid = get().recipeId;
      if (rid) await get().fetchByRecipeId(rid);

      return true;
    } catch (e) {
      set({
        isLoading: false,
        error: msg(e, 'Failed to delete recipe ingredient.'),
      });
      throw e;
    }
  },
}));
