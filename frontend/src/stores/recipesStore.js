import { create } from 'zustand';
import { apiFetch } from '../lib/api';

const msg = (e, fallback) => e?.message || fallback;

export const useRecipesStore = create((set, get) => ({
  items: [],
  recipe: null,

  isLoading: false,
  error: null,
  success: null,

  search: '',
  sort: 'name',
  dir: 'asc',
  productId: '',
  count: 0,

  setQuery: (patch) => set(patch),
  clearMessages: () => set({ error: null, success: null }),
  clearRecipe: () => set({ recipe: null }),

  fetchRecipes: async (params = {}) => {
    const search = params.search ?? get().search;
    const sort = params.sort ?? get().sort;
    const dir = params.dir ?? get().dir;
    const productId = params.productId ?? get().productId;

    const qs = new URLSearchParams();
    if (search) qs.set('search', search);
    if (sort) qs.set('sort', sort);
    if (dir) qs.set('dir', dir);
    if (productId) qs.set('productId', productId);

    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch(`/api/recipes?${qs.toString()}`);
      set({
        items: data.items || [],
        count: data.count ?? 0,
        search,
        sort,
        dir,
        productId,
        isLoading: false,
      });
      return data.items || [];
    } catch (e) {
      set({ isLoading: false, error: msg(e, 'Failed to fetch recipes.') });
      return [];
    }
  },

  fetchRecipeById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch(`/api/recipes/${id}`);
      set({ recipe: data.recipe, isLoading: false });
      return data.recipe;
    } catch (e) {
      set({ isLoading: false, error: msg(e, 'Failed to fetch recipe.') });
      return null;
    }
  },

  createRecipe: async ({ name, description, ingredients }) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const data = await apiFetch('/api/recipes', {
        method: 'POST',
        body: JSON.stringify({ name, description, ingredients }),
      });
      set({ isLoading: false, success: data.message || 'Recipe created.' });
      await get().fetchRecipes();
      return data.recipe;
    } catch (e) {
      set({ isLoading: false, error: msg(e, 'Failed to create recipe.') });
      throw e;
    }
  },

  updateRecipe: async (id, patch) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const data = await apiFetch(`/api/recipes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      });
      set({ isLoading: false, success: data.message || 'Recipe updated.' });
      await get().fetchRecipes();
      return data.recipe;
    } catch (e) {
      set({ isLoading: false, error: msg(e, 'Failed to update recipe.') });
      throw e;
    }
  },

  deleteRecipe: async (id) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const data = await apiFetch(`/api/recipes/${id}`, { method: 'DELETE' });
      set({ isLoading: false, success: data.message || 'Recipe deleted.' });
      await get().fetchRecipes();
      return true;
    } catch (e) {
      set({ isLoading: false, error: msg(e, 'Failed to delete recipe.') });
      throw e;
    }
  },
}));
