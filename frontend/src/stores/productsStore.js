import { create } from 'zustand';
import { apiFetch } from '../lib/api';

const msg = (e, fallback) => e?.message || fallback;

export const useProductsStore = create((set, get) => ({
  items: [],
  product: null,

  isLoading: false,
  error: null,
  success: null,

  search: '',
  sort: 'created_at',
  dir: 'desc',
  count: 0,

  setQuery: (patch) => set(patch),
  clearMessages: () => set({ error: null, success: null }),
  clearProduct: () => set({ product: null }),

  fetchProducts: async (params = {}) => {
    const search = params.search ?? get().search;
    const sort = params.sort ?? get().sort;
    const dir = params.dir ?? get().dir;

    const qs = new URLSearchParams();
    if (search) qs.set('search', search);
    if (sort) qs.set('sort', sort);
    if (dir) qs.set('dir', dir);

    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch(`/api/products?${qs.toString()}`);
      set({
        items: data.items || [],
        count: data.count ?? 0,
        search,
        sort,
        dir,
        isLoading: false,
      });
      return data.items || [];
    } catch (e) {
      set({ isLoading: false, error: msg(e, 'Failed to fetch products.') });
      return [];
    }
  },

  fetchProductById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch(`/api/products/${id}`);
      set({ product: data.product, isLoading: false });
      return data.product;
    } catch (e) {
      set({ isLoading: false, error: msg(e, 'Failed to fetch product.') });
      return null;
    }
  },

  createProduct: async ({ name, unit, price, stock }) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const data = await apiFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify({ name, unit, price, stock }),
      });
      set({ isLoading: false, success: data.message || 'Product created.' });
      await get().fetchProducts();
      return data.product;
    } catch (e) {
      set({ isLoading: false, error: msg(e, 'Failed to create product.') });
      throw e;
    }
  },

  updateProduct: async (id, patch) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const data = await apiFetch(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      });
      set({ isLoading: false, success: data.message || 'Product updated.' });
      await get().fetchProducts();
      return data.product;
    } catch (e) {
      set({ isLoading: false, error: msg(e, 'Failed to update product.') });
      throw e;
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const data = await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
      set({ isLoading: false, success: data.message || 'Product deleted.' });
      await get().fetchProducts();
      return true;
    } catch (e) {
      set({ isLoading: false, error: msg(e, 'Failed to delete product.') });
      throw e;
    }
  },
}));
