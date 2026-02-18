import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../Navbar';
import { useCartStore } from '../../../stores/cartStore';
import { vi } from 'vitest';

vi.mock('../../../assets/logo.png', () => ({ default: 'logo-mock.png' }));

vi.mock('../../../stores/authStore', () => ({
  useAuthStore: (sel) =>
    sel({
      user: { id: 1, role: 'user', name: 'Test', email: 't@test.com' },
      logout: vi.fn(async () => {}),
    }),
}));

vi.mock('../../../stores/currencyStore', () => ({
  useCurrencyStore: (sel) =>
    sel({
      currency: 'USD',
      available: ['USD'],
      setCurrency: vi.fn(),
    }),
}));

function resetCart() {
  useCartStore.setState({ items: [] });
}

describe('Navbar', () => {
  beforeEach(() => {
    resetCart();
  });

  it('does not show badge when cart is empty', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.getAllByText('Cart')[0]).toBeInTheDocument();
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('shows badge with totalItems when cart has items', () => {
    useCartStore.setState({
      items: [
        { productId: 10, name: 'A', price: 2, unit: '', quantity: 2 },
        { productId: 11, name: 'B', price: 5, unit: '', quantity: 3 },
      ],
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.getAllByText('5')[0]).toBeInTheDocument();
  });
});
