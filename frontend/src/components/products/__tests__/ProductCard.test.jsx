import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductCard from '../ProductCard';

vi.mock('../../../utils/helpers', () => ({
  useMoney: (v) => `$${Number(v || 0).toFixed(2)}`,
}));

describe('ProductCard', () => {
  it('calls onAddToCart when Add clicked', async () => {
    const user = userEvent.setup();
    const onAddToCart = vi.fn();

    render(
      <ProductCard
        product={{ id: 1, name: 'Milk', unit: 'L', price: 2.5, stock: 10 }}
        canAddToCart
        onAddToCart={onAddToCart}
      />,
    );

    const btn = screen.getByRole('button', { name: /add/i });
    await user.click(btn);

    expect(onAddToCart).toHaveBeenCalledTimes(1);
    expect(onAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, name: 'Milk' }),
    );
  });

  it('disables Add when stock is 0', () => {
    const onAddToCart = vi.fn();

    render(
      <ProductCard
        product={{ id: 1, name: 'Milk', unit: 'L', price: 2.5, stock: 0 }}
        canAddToCart
        onAddToCart={onAddToCart}
      />,
    );

    const btn = screen.getByRole('button', { name: /add/i });
    expect(btn).toBeDisabled();
  });
});
