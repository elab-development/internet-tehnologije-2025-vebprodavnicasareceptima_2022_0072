import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useCartStore } from '../stores/cartStore';
import { useOrdersStore } from '../stores/ordersStore';
import { useAuthStore } from '../stores/authStore';
import { useMoney } from '../utils/helpers';

import CheckoutModal from '../components/cart/CheckoutModal';

function CartItemRow({ it, decrease, increase, setQuantity, removeItem }) {
  const lineTotal = Number(it.price || 0) * Number(it.quantity || 0);

  const priceLabel = useMoney(it.price);
  const subtotalLabel = useMoney(lineTotal);

  return (
    <div className='rounded-2xl border border-slate-200 bg-white p-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='min-w-0'>
          <div className='text-base font-extrabold text-slate-900 truncate'>
            {it.name}
          </div>
          <div className='mt-1 text-sm text-slate-600'>
            Unit:{' '}
            <span className='font-semibold text-slate-800'>
              {it.unit || '-'}
            </span>
            <span className='mx-2 text-slate-300'>•</span>
            Price:{' '}
            <span className='font-semibold text-slate-800'>{priceLabel}</span>
          </div>
        </div>

        <div className='flex items-center justify-between gap-3 sm:justify-end'>
          <div className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1'>
            <button
              onClick={() => decrease(it.productId)}
              className='inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white'
              aria-label='Decrease'
            >
              <Minus size={18} />
            </button>

            <input
              value={it.quantity}
              onChange={(e) => setQuantity(it.productId, e.target.value)}
              className='h-9 w-14 rounded-lg bg-transparent text-center text-sm font-semibold outline-none'
              inputMode='numeric'
            />

            <button
              onClick={() => increase(it.productId)}
              className='inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white'
              aria-label='Increase'
            >
              <Plus size={18} />
            </button>
          </div>

          <div className='text-right'>
            <div className='text-sm text-slate-500'>Subtotal</div>
            <div className='text-base font-extrabold text-slate-900'>
              {subtotalLabel}
            </div>
          </div>

          <button
            onClick={() => removeItem(it.productId)}
            className='inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            title='Remove item'
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Cart() {
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const role = (user?.role || '').toLowerCase();
  const isUser = role === 'user';

  const items = useCartStore((s) => s.items);
  const increase = useCartStore((s) => s.increase);
  const decrease = useCartStore((s) => s.decrease);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const total = useCartStore((s) => s.totalPrice());
  const count = useCartStore((s) => s.totalItems());

  const totalLabel = useMoney(total);

  const createOrder = useOrdersStore((s) => s.createOrder);
  const isLoading = useOrdersStore((s) => s.isLoading);
  const error = useOrdersStore((s) => s.error);
  const clearMessages = useOrdersStore((s) => s.clearMessages);

  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const orderPayloadItems = useMemo(() => {
    return (items || []).map((it) => ({
      product_id: it.productId,
      quantity: Number(it.quantity || 0),
    }));
  }, [items]);

  async function handleConfirmCheckout(formData) {
    clearMessages();
    if (!isUser) return;

    try {
      const order = await createOrder({ items: orderPayloadItems });
      clear();
      setCheckoutOpen(false);
      navigate(`/orders/${order.id}`);
    } catch {}
  }

  const canCheckout = isUser && items.length > 0 && !isLoading;

  return (
    <div className='mx-auto max-w-6xl px-4 py-10'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <h1 className='text-2xl font-extrabold text-slate-900'>Cart</h1>
          <p className='mt-1 text-sm text-slate-600'>
            {count > 0
              ? `You have ${count} item(s) in your cart.`
              : 'Your cart is empty.'}
          </p>
        </div>

        {items.length ? (
          <button
            onClick={clear}
            className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50'
          >
            <Trash2 size={18} />
            Clear cart
          </button>
        ) : null}
      </div>

      {error ? (
        <div className='mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
          {error}
        </div>
      ) : null}

      {!items.length ? (
        <div className='mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center'>
          <div className='mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50'>
            <ShoppingBag className='text-slate-600' />
          </div>
          <div className='mt-3 text-base font-bold text-slate-900'>
            No items yet
          </div>
          <div className='mt-1 text-sm text-slate-600'>
            Go to Products and add something to your cart.
          </div>
          <Link
            to='/products'
            className='mt-5 inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700'
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className='mt-6 grid gap-6 lg:grid-cols-3'>
          {/* Items */}
          <div className='lg:col-span-2 space-y-3'>
            {items.map((it) => (
              <CartItemRow
                key={it.productId}
                it={it}
                decrease={decrease}
                increase={increase}
                setQuantity={setQuantity}
                removeItem={removeItem}
              />
            ))}
          </div>

          {/* Summary */}
          <div className='rounded-2xl border border-slate-200 bg-white p-5 h-fit'>
            <div className='text-base font-extrabold text-slate-900'>
              Summary
            </div>

            <div className='mt-4 space-y-2 text-sm'>
              <div className='flex items-center justify-between text-slate-700'>
                <span>Items</span>
                <span className='font-semibold'>{count}</span>
              </div>

              <div className='flex items-center justify-between text-slate-700'>
                <span>Total</span>
                <span className='text-lg font-extrabold text-slate-900'>
                  {totalLabel}
                </span>
              </div>
            </div>

            {!user ? (
              <div className='mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
                Please sign in to checkout.
                <div className='mt-2 flex gap-2'>
                  <Link
                    to='/login'
                    className='inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700'
                  >
                    Login
                  </Link>
                  <Link
                    to='/register'
                    className='inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50'
                  >
                    Register
                  </Link>
                </div>
              </div>
            ) : !isUser ? (
              <div className='mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700'>
                Checkout is available only for{' '}
                <span className='font-semibold'>user</span> accounts.
              </div>
            ) : null}

            <button
              onClick={() => {
                clearMessages();
                setCheckoutOpen(true);
              }}
              disabled={!canCheckout}
              className='mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60'
            >
              <CreditCard size={18} />
              {isLoading ? 'Processing...' : 'Checkout'}
            </button>

            <div className='mt-3 text-xs text-slate-500'>
              After checkout, your order will be created and you’ll be
              redirected to order details.
            </div>
          </div>
        </div>
      )}

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={items}
        total={total}
        isLoading={isLoading}
        error={error}
        onConfirm={handleConfirmCheckout}
      />
    </div>
  );
}
