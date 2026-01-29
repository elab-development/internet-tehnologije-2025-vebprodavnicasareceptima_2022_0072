import { create } from 'zustand';
import { apiFetch } from '../lib/api';

const msg = (e, fallback) => e?.message || fallback;

export const useOrderItemsStore = create((set, get) => ({
  items: [],
  count: 0,
  orderId: '',

  isLoading: false,
  error: null,
  success: null,

  setOrderId: (orderId) => set({ orderId }),
  clearMessages: () => set({ error: null, success: null }),

  fetchByOrderId: async (orderId) => {
    const oid = orderId ?? get().orderId;
    if (!oid) {
      set({ items: [], count: 0 });
      return [];
    }

    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch(
        `/api/order-items?orderId=${encodeURIComponent(oid)}`,
      );
      set({
        items: data.items || [],
        count: data.count ?? 0,
        orderId: oid,
        isLoading: false,
      });
      return data.items || [];
    } catch (e) {
      set({ isLoading: false, error: msg(e, 'Failed to fetch order items.') });
      return [];
    }
  },

  updateQuantity: async (itemId, quantity) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const data = await apiFetch(`/api/order-items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
      set({ isLoading: false, success: data.message || 'Order item updated.' });

      const oid = get().orderId;
      if (oid) await get().fetchByOrderId(oid);

      return true;
    } catch (e) {
      set({ isLoading: false, error: msg(e, 'Failed to update order item.') });
      throw e;
    }
  },
}));
