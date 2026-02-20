import { create } from 'zustand';
import { apiFetch } from '../lib/api';

const msg = (e, fallback) => e?.message || fallback;

export const useAdminOverviewStore = create((set, get) => ({
  data: null,
  isLoading: false,
  error: null,

  days: 30,
  lowStock: 5,

  setQuery: (patch) => set(patch),
  clearMessages: () => set({ error: null }),

  fetchOverview: async (params = {}) => {
    const days = params.days ?? get().days;
    const lowStock = params.lowStock ?? get().lowStock;

    const qs = new URLSearchParams();
    if (days) qs.set('days', String(days));
    if (lowStock !== undefined && lowStock !== null)
      qs.set('lowStock', String(lowStock));

    set({ isLoading: true, error: null });

    try {
      const data = await apiFetch(`/api/admin/overview?${qs.toString()}`);
      set({ data, days, lowStock, isLoading: false });
      return data;
    } catch (e) {
      set({
        isLoading: false,
        error: msg(e, 'Failed to fetch admin overview.'),
      });
      return null;
    }
  },
}));
