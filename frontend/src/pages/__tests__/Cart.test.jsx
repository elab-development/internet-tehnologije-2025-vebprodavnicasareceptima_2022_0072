import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { act } from 'react';
import Cart from '../Cart';
import { useCartStore } from '../../stores/cartStore';

vi.mock('../../utils/helpers', () => ({
  useMoney: (v) => `$${Number(v || 0).toFixed(2)}`,
}));

vi.mock('../../stores/authStore', () => ({
  useAuthStore: (sel) =>
    sel({
      user: { id: 1, role: 'user', name: 'Test', email: 't@test.com' },
    }),
}));

vi.mock('../../stores/ordersStore', () => ({
  useOrdersStore: (sel) =>
    sel({
      createOrder: vi.fn(async () => ({ id: 999 })),
      isLoading: false,
      error: null,
      clearMessages: vi.fn(),
    }),
}));

vi.mock('../../components/cart/CheckoutModal', () => ({
  default: () => null,
}));

function resetCart() {
  useCartStore.setState({ items: [] });
}

describe('Cart page', () => {
  beforeEach(() => {
    resetCart();
  });

  it('shows empty state when no items', () => {
    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>,
    );

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    expect(screen.getByText(/no items yet/i)).toBeInTheDocument();
  });

  it('renders items and allows increase/decrease/remove/clear', async () => {
    const user = userEvent.setup();

    // seed BEFORE render
    useCartStore.setState({
      items: [
        { productId: 10, name: 'Milk', unit: 'L', price: 2, quantity: 2 },
      ],
    });

    const { rerender } = render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>,
    );

    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();

    // Increase
    await user.click(screen.getByLabelText('Increase'));
    expect(useCartStore.getState().items[0].quantity).toBe(3);

    // Decrease
    await user.click(screen.getByLabelText('Decrease'));
    expect(useCartStore.getState().items[0].quantity).toBe(2);

    // Remove item
    await user.click(screen.getByTitle(/remove item/i));
    expect(useCartStore.getState().items).toHaveLength(0);

    await act(async () => {
      useCartStore.setState({
        items: [
          { productId: 10, name: 'Milk', unit: 'L', price: 2, quantity: 2 },
        ],
      });
    });

    rerender(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /clear cart/i }));
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
