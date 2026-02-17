import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Shield, XCircle, ArrowRight } from 'lucide-react';

import { useAuthStore } from '../stores/authStore';
import { useOrdersStore } from '../stores/ordersStore';
import { badge, useMoney } from '../utils/helpers';

function OrderCard({ o, isUser, onCancel }) {
  const status = String(o.status || '').toUpperCase();
  const canCancel = isUser && status === 'PENDING';
  const totalLabel = useMoney(o.total_price);

  return (
    <div className='rounded-xl border border-slate-200 bg-white p-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='min-w-0'>
          <div className='flex flex-wrap items-center gap-2'>
            <div className='text-sm font-extrabold text-slate-900'>
              Order #{o.id}
            </div>
            <span className={badge(o.status)}>{status}</span>
          </div>

          <div className='mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-slate-700'>
            <div>
              Total:{' '}
              <span className='font-extrabold text-slate-900'>
                {totalLabel}
              </span>
            </div>
            <div className='text-slate-500'>
              Created:{' '}
              <span className='font-semibold text-slate-700'>
                {o.created_at ? new Date(o.created_at).toLocaleString() : '—'}
              </span>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2 sm:justify-end'>
          <Link
            to={`/orders/${o.id}`}
            className='inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700'
          >
            Details
            <ArrowRight size={18} />
          </Link>

          {canCancel ? (
            <button
              onClick={() => onCancel(o.id)}
              className='inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50'
              title='Cancel order'
            >
              <XCircle size={18} />
              Cancel
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const user = useAuthStore((s) => s.user);

  const fetchOrders = useOrdersStore((s) => s.fetchOrders);
  const orders = useOrdersStore((s) => s.items);
  const isLoading = useOrdersStore((s) => s.isLoading);
  const error = useOrdersStore((s) => s.error);
  const success = useOrdersStore((s) => s.success);
  const clearMessages = useOrdersStore((s) => s.clearMessages);
  const cancelOrder = useOrdersStore((s) => s.cancelOrder);

  const role = (user?.role || '').toLowerCase();
  const isUser = role === 'user';
  const isAdmin = role === 'admin';

  useEffect(() => {
    clearMessages();
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sorted = useMemo(() => orders || [], [orders]);

  async function onCancel(orderId) {
    clearMessages();
    try {
      await cancelOrder(orderId);
      await fetchOrders();
    } catch {}
  }

  return (
    <div className='mx-auto max-w-6xl px-4 py-10'>
      <div className='grid gap-6 lg:grid-cols-3'>
        {/* Profile card */}
        <div className='rounded-2xl border border-slate-200 bg-white p-6 h-fit'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <div className='text-2xl font-extrabold text-slate-900'>
                Profile
              </div>
              <div className='mt-1 text-sm text-slate-600'>
                Your account information.
              </div>
            </div>
            <div className='inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50'>
              <User className='text-slate-700' />
            </div>
          </div>

          <div className='mt-5 space-y-3 text-sm'>
            <div className='flex items-center gap-2 text-slate-700'>
              <User size={18} className='text-slate-500' />
              <span className='font-semibold text-slate-900'>{user?.name}</span>
            </div>
            <div className='flex items-center gap-2 text-slate-700'>
              <Mail size={18} className='text-slate-500' />
              <span className='font-semibold text-slate-900'>
                {user?.email}
              </span>
            </div>
            <div className='flex items-center gap-2 text-slate-700'>
              <Shield size={18} className='text-slate-500' />
              <span className='font-semibold text-slate-900'>
                {isAdmin ? 'Admin' : 'User'}
              </span>
            </div>
          </div>

          <div className='mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600'>
            {isAdmin
              ? 'Admins can manage catalog and update order statuses.'
              : 'Users can view and cancel PENDING orders.'}
          </div>
        </div>

        {/* Orders */}
        <div className='lg:col-span-2 space-y-4'>
          <div className='rounded-2xl border border-slate-200 bg-white p-6'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <div className='text-base font-extrabold text-slate-900'>
                  My orders
                </div>
                <div className='mt-1 text-sm text-slate-600'>
                  View your order history and status.
                </div>
              </div>

              <button
                onClick={() => fetchOrders()}
                className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50'
              >
                Refresh
              </button>
            </div>

            {error ? (
              <div className='mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
                {error}
              </div>
            ) : null}

            {success ? (
              <div className='mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700'>
                {success}
              </div>
            ) : null}

            {isLoading ? (
              <div className='mt-4 text-sm text-slate-600'>
                Loading orders...
              </div>
            ) : !sorted.length ? (
              <div className='mt-4 text-sm text-slate-600'>
                No orders yet.{' '}
                <Link
                  className='font-semibold text-red-600 hover:underline'
                  to='/products'
                >
                  Browse products
                </Link>
              </div>
            ) : (
              <div className='mt-4 space-y-3'>
                {sorted.map((o) => (
                  <OrderCard
                    key={o.id}
                    o={o}
                    isUser={isUser}
                    onCancel={onCancel}
                  />
                ))}
              </div>
            )}
          </div>

          {isAdmin ? (
            <div className='rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700'>
              Admins see all orders in the Admin page (filters by user/status).
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
