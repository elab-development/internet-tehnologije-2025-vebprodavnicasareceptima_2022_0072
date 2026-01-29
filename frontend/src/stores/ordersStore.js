import { create } from 'zustand';
import { apiFetch } from '../lib/api';

const msg = (e, fallback) => e?.message || fallback;

export const useOrdersStore = create((set, get) => ({
  items: [],
  order: null,

  isLoading: false,
  error: null,
  success: null,

  sort: 'created_at',
  dir: 'desc',
  status: '',
  userId: '',
  count: 0,

  setQuery: (patch) => set(patch),
  clearMessages: () => set({ error: null, success: null }),
  clearOrder: () => set({ order: null }),

  createOrder: async ({ items }) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const data = await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ items }),
      });
      set({
        isLoading: false,
        success: data.message || 'Order created.',
        order: data.order,
      });
      await get().fetchOrders();
      return data.order;
    } catch (e) {
      set({ isLoading: false, error: msg(e, 'Failed to create order.') });
      throw e;
    }
  },

  fetchOrders: async (params = {}) => {
    const sort = params.sort ?? get().sort;
    const dir = params.dir ?? get().dir;
    const status = params.status ?? get().status;
    const userId = params.userId ?? get().userId;

    const qs = new URLSearchParams();
    if (sort) qs.set('sort', sort);
    if (dir) qs.set('dir', dir);
    if (status) qs.set('status', status);
    if (userId) qs.set('userId', userId);

    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch(`/api/orders?${qs.toString()}`);
      set({
        items: data.items || [],
        count: data.count ?? 0,
        sort,
        dir,
        status,
        userId,
        isLoading: false,
      });
      return data.items || [];
    } catch (e) {
      set({ isLoading: false, error: msg(e, 'Failed to fetch orders.') });
      return [];
    }
  },

  fetchOrderById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch(`/api/orders/${id}`);
      set({ order: data.order, isLoading: false });
      return data.order;
    } catch (e) {
      set({ isLoading: false, error: msg(e, 'Failed to fetch order.') });
      return null;
    }
  },

  cancelOrder: async (id) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const data = await apiFetch(`/api/orders/${id}/cancel`, {
        method: 'POST',
      });
      set({ isLoading: false, success: data.message || 'Order cancelled.' });
      await get().fetchOrders();
      if (get().order?.id === id) await get().fetchOrderById(id);
      return true;
    } catch (e) {
      set({ isLoading: false, error: msg(e, 'Failed to cancel order.') });
      throw e;
    }
  },

  adminUpdateStatus: async (id, status) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const data = await apiFetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      set({ isLoading: false, success: data.message || 'Status updated.' });
      await get().fetchOrders();
      if (get().order?.id === id) await get().fetchOrderById(id);
      return data.status;
    } catch (e) {
      set({ isLoading: false, error: msg(e, 'Failed to update status.') });
      throw e;
    }
  },
}));
