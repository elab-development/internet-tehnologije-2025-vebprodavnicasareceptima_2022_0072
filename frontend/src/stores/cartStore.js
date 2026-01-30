import { create } from 'zustand';

const STORAGE_KEY = 'shopthestep_cart_v1';

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : null;
    if (!data || typeof data !== 'object') return { items: [] };
    if (!Array.isArray(data.items)) return { items: [] };
    return { items: data.items };
  } catch {
    return { items: [] };
  }
}

function writeStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items }));
  } catch {}
}

const toInt = (v, fallback = 1) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.floor(n);
  return i;
};

export const useCartStore = create((set, get) => ({
  items: readStorage().items,

  hydrate: () => {
    const next = readStorage().items;
    set({ items: next });
  },

  clear: () => {
    const next = { items: [] };
    set(next);
    writeStorage(next);
  },

  removeItem: (productId) => {
    const id = toInt(productId, null);
    if (id === null) return;

    const items = get().items.filter((it) => it.productId !== id);
    const next = { items };
    set(next);
    writeStorage(next);
  },

  setQuantity: (productId, quantity) => {
    const id = toInt(productId, null);
    const qty = toInt(quantity, 1);
    if (id === null) return;

    const items = get().items.map((it) =>
      it.productId === id ? { ...it, quantity: Math.max(1, qty) } : it,
    );
    const next = { items };
    set(next);
    writeStorage(next);
  },

  increase: (productId, step = 1) => {
    const id = toInt(productId, null);
    const s = toInt(step, 1);
    if (id === null) return;

    const items = get().items.map((it) =>
      it.productId === id
        ? { ...it, quantity: it.quantity + Math.max(1, s) }
        : it,
    );
    const next = { items };
    set(next);
    writeStorage(next);
  },

  decrease: (productId, step = 1) => {
    const id = toInt(productId, null);
    const s = toInt(step, 1);
    if (id === null) return;

    const items = get().items.map((it) =>
      it.productId === id
        ? { ...it, quantity: Math.max(1, it.quantity - Math.max(1, s)) }
        : it,
    );
    const next = { items };
    set(next);
    writeStorage(next);
  },

  addItem: (product, quantity = 1) => {
    const id = toInt(product?.id, null);
    if (id === null) return;

    const qty = Math.max(1, toInt(quantity, 1));

    const items = [...get().items];
    const idx = items.findIndex((it) => it.productId === id);

    if (idx >= 0) {
      items[idx] = { ...items[idx], quantity: items[idx].quantity + qty };
    } else {
      items.push({
        productId: id,
        name: product?.name || 'Product',
        unit: product?.unit || '',
        price: Number(product?.price ?? 0),
        quantity: qty,
      });
    }

    const next = { items };
    set(next);
    writeStorage(next);
  },

  // derived helpers
  totalItems: () =>
    get().items.reduce((sum, it) => sum + (it.quantity || 0), 0),
  totalPrice: () =>
    get().items.reduce(
      (sum, it) => sum + Number(it.price || 0) * (it.quantity || 0),
      0,
    ),
}));
