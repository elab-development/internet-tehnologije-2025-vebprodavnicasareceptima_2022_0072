import { create } from 'zustand';
import { fetchUsdRates } from '../lib/currencyApi';

const STORAGE_KEY = 'shopthestep_currency';

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : null;
    if (!data || typeof data !== 'object') return { currency: 'USD' };
    return { currency: String(data.currency || 'USD').toUpperCase() };
  } catch {
    return { currency: 'USD' };
  }
}

function writeStorage(currency) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ currency }));
  } catch {}
}

export const useCurrencyStore = create((set, get) => ({
  currency: readStorage().currency,
  rates: { USD: 1 },
  available: ['USD'],
  updatedAt: null,

  isLoading: false,
  error: null,

  init: async () => {
    const controller = new AbortController();
    set({ isLoading: true, error: null });

    try {
      const { rates, updatedAt } = await fetchUsdRates(controller.signal);
      const available = Object.keys(rates).sort();

      const cur = get().currency;
      const nextCurrency = rates[cur] ? cur : 'USD';
      if (nextCurrency !== cur) writeStorage(nextCurrency);

      set({
        rates,
        available,
        updatedAt,
        currency: nextCurrency,
        isLoading: false,
      });
    } catch (e) {
      set({
        isLoading: false,
        error: e?.message || 'Failed to load currency rates.',
      });
    }
  },

  setCurrency: (currency) => {
    const cur = String(currency || 'USD').toUpperCase();
    const rates = get().rates || {};
    const next = rates[cur] ? cur : 'USD';
    set({ currency: next });
    writeStorage(next);
  },

  refresh: async () => {
    await get().init();
  },

  rateFor: (currency) => {
    const cur = String(currency || get().currency || 'USD').toUpperCase();
    return Number(get().rates?.[cur] ?? 1);
  },
}));
