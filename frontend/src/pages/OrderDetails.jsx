import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  PackageCheck,
  XCircle,
  ShoppingBag,
  Shield,
} from 'lucide-react';

import { useOrdersStore } from '../stores/ordersStore';
import { useAuthStore } from '../stores/authStore';
import { badge, useMoney } from '../utils/helpers';

function OrderItemRow({ it }) {
  const qty = Number(it.quantity || 0);
  const price = Number(it.price_at_purchase || 0);
  const line = qty * price;

  const priceLabel = useMoney(price);
  const lineLabel = useMoney(line);

  return (
    <div className='rounded-xl border border-slate-200 bg-white p-4'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
        <div className='min-w-0'>
          <div className='text-sm font-extrabold text-slate-900 truncate'>
            {it.product_name || `Product #${it.product_id}`}
          </div>
          <div className='mt-1 text-sm text-slate-600'>
            Qty: <span className='font-semibold text-slate-800'>{qty}</span>
            <span className='mx-2 text-slate-300'>•</span>
            Price:{' '}
            <span className='font-semibold text-slate-800'>{priceLabel}</span>
          </div>
        </div>

        <div className='text-right'>
          <div className='text-xs text-slate-500'>Subtotal</div>
          <div className='text-base font-extrabold text-slate-900'>
            {lineLabel}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const role = (user?.role || '').toLowerCase();
  const isUser = role === 'user';
  const isAdmin = role === 'admin';

  const order = useOrdersStore((s) => s.order);
  const isLoading = useOrdersStore((s) => s.isLoading);
  const error = useOrdersStore((s) => s.error);
  const success = useOrdersStore((s) => s.success);

  const clearMessages = useOrdersStore((s) => s.clearMessages);
  const clearOrder = useOrdersStore((s) => s.clearOrder);

  const fetchOrderById = useOrdersStore((s) => s.fetchOrderById);
  const cancelOrder = useOrdersStore((s) => s.cancelOrder);

  const totalLabel = useMoney(order?.total_price ?? 0);

  useEffect(() => {
    clearMessages();
    clearOrder();

    if (!orderId) return;
    fetchOrderById(orderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const forbidden = useMemo(() => {
    if (!order) return false;
    if (isAdmin) return false;
    if (isUser && order.user_id !== user?.id) return true;
    return false;
  }, [order, isAdmin, isUser, user?.id]);

  const canCancel = useMemo(() => {
    if (!order) return false;
    if (!isUser) return false;
    if (order.user_id !== user?.id) return false;
    return String(order.status || '').toUpperCase() === 'PENDING';
  }, [order, isUser, user?.id]);

  async function onCancel() {
    if (!order) return;
    clearMessages();
    try {
      await cancelOrder(order.id);
      await fetchOrderById(order.id);
    } catch {}
  }

  if (
    !isLoading &&
    (forbidden || (error && String(error).toLowerCase().includes('forbidden')))
  ) {
    return (
      <div className='mx-auto max-w-6xl px-4 py-10'>
        <Link
          to='/profile'
          className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50'
        >
          <ArrowLeft size={18} />
          Back to Profile
        </Link>

        <div className='mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center'>
          <div className='mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50'>
            <Shield className='text-slate-700' />
          </div>
          <div className='mt-3 text-base font-extrabold text-slate-900'>
            You can’t view this order
          </div>
          <div className='mt-1 text-sm text-slate-600'>
            This order belongs to another user.
          </div>
          <Link
            to='/profile'
            className='mt-5 inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700'
          >
            Go to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-6xl px-4 py-10'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div className='flex items-start gap-3'>
          <button
            onClick={() => navigate(-1)}
            className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50'
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div>
            <h1 className='text-2xl font-extrabold text-slate-900'>
              Order details
            </h1>
            <p className='mt-1 text-sm text-slate-600'>
              Review items, totals, and status.
            </p>
          </div>
        </div>

        {canCancel ? (
          <button
            onClick={onCancel}
            disabled={isLoading}
            className='inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60'
            title='Cancel order'
          >
            <XCircle size={18} />
            Cancel (PENDING only)
          </button>
        ) : null}
      </div>

      {error ? (
        <div className='mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
          {error}
        </div>
      ) : null}

      {success ? (
        <div className='mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700'>
          {success}
        </div>
      ) : null}

      {isLoading && !order ? (
        <div className='mt-6 text-sm text-slate-600'>Loading order...</div>
      ) : !order ? (
        <div className='mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center'>
          <div className='mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50'>
            <ShoppingBag className='text-slate-700' />
          </div>
          <div className='mt-3 text-base font-extrabold text-slate-900'>
            Order not found
          </div>
          <div className='mt-1 text-sm text-slate-600'>
            It may not exist or you don’t have access.
          </div>
          <Link
            to='/profile'
            className='mt-5 inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700'
          >
            Go to Profile
          </Link>
        </div>
      ) : (
        <div className='mt-6 grid gap-6 lg:grid-cols-3'>
          {/* Items */}
          <div className='lg:col-span-2 space-y-3'>
            <div className='rounded-2xl border border-slate-200 bg-white p-5'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div className='flex items-center gap-2'>
                  <PackageCheck className='text-slate-700' />
                  <div className='text-base font-extrabold text-slate-900'>
                    Items
                  </div>
                </div>

                <div className={badge(order.status)}>
                  {String(order.status || '').toUpperCase()}
                </div>
              </div>

              <div className='mt-4 space-y-3'>
                {(order.items || []).map((it) => (
                  <OrderItemRow key={it.id} it={it} />
                ))}

                {!order.items?.length ? (
                  <div className='text-sm text-slate-600'>
                    No items found for this order.
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className='rounded-2xl border border-slate-200 bg-white p-5 h-fit'>
            <div className='text-base font-extrabold text-slate-900'>
              Summary
            </div>

            <div className='mt-4 space-y-2 text-sm'>
              <div className='flex items-center justify-between text-slate-700'>
                <span>Order ID</span>
                <span className='font-semibold'>#{order.id}</span>
              </div>

              <div className='flex items-center justify-between text-slate-700'>
                <span>User</span>
                <span className='font-semibold'>{order.user_id}</span>
              </div>

              <div className='flex items-center justify-between text-slate-700'>
                <span>Created</span>
                <span className='font-semibold'>
                  {order.created_at
                    ? new Date(order.created_at).toLocaleString()
                    : '—'}
                </span>
              </div>

              <div className='mt-2 border-t border-slate-200 pt-3 flex items-center justify-between text-slate-700'>
                <span>Total</span>
                <span className='text-lg font-extrabold text-slate-900'>
                  {totalLabel}
                </span>
              </div>
            </div>

            {canCancel ? (
              <button
                onClick={onCancel}
                disabled={isLoading}
                className='mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60'
              >
                <XCircle size={18} />
                Cancel order
              </button>
            ) : (
              <div className='mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600'>
                {isUser
                  ? 'Cancel is available only while the order is PENDING.'
                  : 'Admins manage order statuses in Admin panel.'}
              </div>
            )}

            <Link
              to='/profile'
              className='mt-3 inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50'
            >
              Back to Profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
