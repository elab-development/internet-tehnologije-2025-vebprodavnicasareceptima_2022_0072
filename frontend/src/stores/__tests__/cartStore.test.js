import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../cartStore';

const STORAGE_KEY = 'shopthestep_cart_v1';

function seedStorage(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
}

function resetStore() {
  useCartStore.setState({ items: [] });
}

describe('useCartStore', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  it('initial state loads from localStorage via hydrate()', () => {
    seedStorage([{ productId: 1, name: 'A', price: 2, quantity: 3 }]);

    useCartStore.getState().hydrate();

    expect(useCartStore.getState().items).toEqual([
      { productId: 1, name: 'A', price: 2, quantity: 3 },
    ]);
  });

  it('addItem adds new line and writes to storage', () => {
    useCartStore
      .getState()
      .addItem({ id: 10, name: 'Milk', unit: 'L', price: 1.5 }, 2);

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      productId: 10,
      name: 'Milk',
      unit: 'L',
      price: 1.5,
      quantity: 2,
    });

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw);
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0].productId).toBe(10);
  });

  it('addItem increments quantity if product already exists', () => {
    useCartStore.getState().addItem({ id: 1, name: 'A', price: 2 }, 1);
    useCartStore.getState().addItem({ id: 1, name: 'A', price: 2 }, 3);

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(4);
  });

  it('setQuantity clamps min to 1', () => {
    useCartStore.getState().addItem({ id: 1, name: 'A', price: 2 }, 2);

    useCartStore.getState().setQuantity(1, 0);
    expect(useCartStore.getState().items[0].quantity).toBe(1);

    useCartStore.getState().setQuantity(1, -10);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it('increase adds step (min 1)', () => {
    useCartStore.getState().addItem({ id: 1, name: 'A', price: 2 }, 2);

    useCartStore.getState().increase(1, 2);
    expect(useCartStore.getState().items[0].quantity).toBe(4);

    useCartStore.getState().increase(1, 0); // step min 1
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it('decrease never goes below 1', () => {
    useCartStore.getState().addItem({ id: 1, name: 'A', price: 2 }, 2);

    useCartStore.getState().decrease(1, 10);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it('removeItem removes product line', () => {
    useCartStore.getState().addItem({ id: 1, name: 'A', price: 2 }, 1);
    useCartStore.getState().addItem({ id: 2, name: 'B', price: 5 }, 1);

    useCartStore.getState().removeItem(1);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].productId).toBe(2);
  });

  it('clear empties items and storage', () => {
    useCartStore.getState().addItem({ id: 1, name: 'A', price: 2 }, 1);
    useCartStore.getState().clear();

    expect(useCartStore.getState().items).toEqual([]);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual({
      items: [],
    });
  });

  it('totalItems and totalPrice compute correctly', () => {
    useCartStore.getState().addItem({ id: 1, name: 'A', price: 2 }, 3);
    useCartStore.getState().addItem({ id: 2, name: 'B', price: 5 }, 2);

    expect(useCartStore.getState().totalItems()).toBe(5);
    expect(useCartStore.getState().totalPrice()).toBe(3 * 2 + 2 * 5);
  });
});
