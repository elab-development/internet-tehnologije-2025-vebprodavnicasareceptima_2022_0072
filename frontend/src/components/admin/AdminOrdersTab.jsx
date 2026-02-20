import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RefreshCw,
  ArrowUpDown,
  Filter,
  Search,
  ExternalLink,
} from 'lucide-react';

import { useOrdersStore } from '../../stores/ordersStore';
import { badge } from '../../utils/helpers';

const STATUS_OPTIONS = [
  '',
  'PENDING',
  'PROCESSING',
  'PAID',
  'COMPLETED',
  'CANCELLED',
];
const SORT_OPTIONS = [
  { value: 'created_at', label: 'Created at' },
  { value: 'total_price', label: 'Total price' },
];

function SmallButton({ children, className = '', ...props }) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition',
        'border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}

export default function AdminOrdersTab() {
  const items = useOrdersStore((s) => s.items);
  const count = useOrdersStore((s) => s.count);
  const isLoading = useOrdersStore((s) => s.isLoading);
  const error = useOrdersStore((s) => s.error);
  const success = useOrdersStore((s) => s.success);

  const sort = useOrdersStore((s) => s.sort);
  const dir = useOrdersStore((s) => s.dir);
  const status = useOrdersStore((s) => s.status);
  const userId = useOrdersStore((s) => s.userId);

  const setQuery = useOrdersStore((s) => s.setQuery);
  const clearMessages = useOrdersStore((s) => s.clearMessages);

  const fetchOrders = useOrdersStore((s) => s.fetchOrders);
  const adminUpdateStatus = useOrdersStore((s) => s.adminUpdateStatus);

  const [userIdDraft, setUserIdDraft] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setUserIdDraft(userId || '');
  }, [userId]);

  const hasFilters = useMemo(() => {
    return Boolean(status) || Boolean(userId);
  }, [status, userId]);

  function applyUserFilter(e) {
    e.preventDefault();
    clearMessages?.();
    const next = userIdDraft.trim();
    setQuery({ userId: next });
    fetchOrders({ userId: next });
  }

  function resetFilters() {
    clearMessages?.();
    setUserIdDraft('');
    setQuery({ status: '', userId: '', sort: 'created_at', dir: 'desc' });
    fetchOrders({ status: '', userId: '', sort: 'created_at', dir: 'desc' });
  }

  function toggleDir() {
    const next = dir === 'asc' ? 'desc' : 'asc';
    clearMessages?.();
    setQuery({ dir: next });
    fetchOrders({ dir: next });
  }

  async function changeStatus(orderId, nextStatus) {
    if (!nextStatus) return;
    clearMessages?.();
    setBusyId(orderId);
    try {
      await adminUpdateStatus(orderId, nextStatus);
    } catch {
      // store sets error
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <div className='text-lg font-extrabold text-slate-900'>Orders</div>
          <div className='mt-1 text-sm text-slate-600'>
            View all orders and update their status. ({count} total)
          </div>
        </div>

        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
          <SmallButton
            onClick={() => fetchOrders()}
            disabled={isLoading}
            type='button'
          >
            <RefreshCw size={18} />
            Refresh
          </SmallButton>

          <SmallButton onClick={toggleDir} type='button'>
            <ArrowUpDown size={18} />
            Direction: {String(dir).toUpperCase()}
          </SmallButton>
        </div>
      </div>

      {/* Messages */}
      {error ? (
        <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
          {error}
        </div>
      ) : null}
      {success ? (
        <div className='rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800'>
          {success}
        </div>
      ) : null}

      {/* Filters */}
      <div className='rounded-2xl border border-slate-200 bg-white p-4'>
        <div className='grid gap-3 md:grid-cols-12'>
          {/* Status */}
          <div className='md:col-span-4'>
            <label className='text-sm font-semibold text-slate-800'>
              Status
            </label>
            <div className='mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2'>
              <Filter size={18} className='text-slate-500' />
              <select
                value={status || ''}
                onChange={(e) => {
                  const next = e.target.value;
                  clearMessages?.();
                  setQuery({ status: next });
                  fetchOrders({ status: next });
                }}
                className='w-full bg-transparent text-sm outline-none'
              >
                <option value=''>All statuses</option>
                {STATUS_OPTIONS.filter(Boolean).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* User ID */}
          <form onSubmit={applyUserFilter} className='md:col-span-5'>
            <label className='text-sm font-semibold text-slate-800'>
              User ID
            </label>
            <div className='mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-red-200'>
              <Search size={18} className='text-slate-500' />
              <input
                value={userIdDraft}
                onChange={(e) => setUserIdDraft(e.target.value)}
                className='w-full bg-transparent text-sm outline-none'
                placeholder='Filter by userId'
                inputMode='numeric'
              />
              <button
                type='submit'
                className='rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700'
              >
                Apply
              </button>
            </div>
            <div className='mt-1 text-xs text-slate-500'>
              Leave empty to show orders for all users.
            </div>
          </form>

          {/* Sort */}
          <div className='md:col-span-3'>
            <label className='text-sm font-semibold text-slate-800'>Sort</label>
            <div className='mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2'>
              <ArrowUpDown size={18} className='text-slate-500' />
              <select
                value={sort}
                onChange={(e) => {
                  const next = e.target.value;
                  clearMessages?.();
                  setQuery({ sort: next });
                  fetchOrders({ sort: next });
                }}
                className='w-full bg-transparent text-sm outline-none'
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className='mt-2 flex justify-end'>
              <button
                type='button'
                onClick={resetFilters}
                className={[
                  'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition',
                  hasFilters
                    ? 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                    : 'border-slate-200 bg-white text-slate-500 opacity-60',
                ].join(' ')}
                disabled={
                  !hasFilters && sort === 'created_at' && dir === 'desc'
                }
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
        <div className='overflow-x-auto'>
          <table className='min-w-245 w-full text-left text-sm'>
            <thead className='bg-slate-50 text-slate-700'>
              <tr>
                <th className='px-4 py-3 font-extrabold'>Order</th>
                <th className='px-4 py-3 font-extrabold'>User</th>
                <th className='px-4 py-3 font-extrabold'>Created</th>
                <th className='px-4 py-3 font-extrabold'>Total</th>
                <th className='px-4 py-3 font-extrabold'>Status</th>
                <th className='px-4 py-3 font-extrabold'>Admin action</th>
                <th className='px-4 py-3 font-extrabold'>Details</th>
              </tr>
            </thead>

            <tbody className='divide-y divide-slate-200'>
              {items?.length ? (
                items.map((o) => {
                  const oid = o.id;
                  const created = o.created_at
                    ? new Date(o.created_at).toLocaleString()
                    : '-';

                  const statusUp = String(o.status || '').toUpperCase();
                  const isBusy = busyId === oid || isLoading;

                  return (
                    <tr key={oid} className='hover:bg-slate-50/60'>
                      <td className='px-4 py-3'>
                        <div className='font-extrabold text-slate-900'>
                          #{oid}
                        </div>
                      </td>

                      <td className='px-4 py-3 text-slate-700'>
                        <span className='font-semibold text-slate-900'>
                          #{o.user_id}
                        </span>
                      </td>

                      <td className='px-4 py-3 text-slate-700'>{created}</td>

                      <td className='px-4 py-3'>
                        <span className='text-base font-extrabold text-slate-900'>
                          ${o.total_price || '0.00'}
                        </span>
                      </td>

                      <td className='px-4 py-3'>
                        <span className={badge(statusUp)}>
                          {statusUp || 'UNKNOWN'}
                        </span>
                      </td>

                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-2'>
                          <select
                            value={statusUp}
                            onChange={(e) => changeStatus(oid, e.target.value)}
                            disabled={isBusy}
                            className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none disabled:opacity-60'
                            title='Update status'
                          >
                            {STATUS_OPTIONS.filter(Boolean).map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>

                          {isBusy ? (
                            <span className='text-xs font-semibold text-slate-500'>
                              Updating...
                            </span>
                          ) : null}
                        </div>

                        <div className='mt-1 text-xs text-slate-500'>
                          Backend will block changes after final status.
                        </div>
                      </td>

                      <td className='px-4 py-3'>
                        <Link
                          to={`/orders/${oid}`}
                          className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50'
                          onClick={() => clearMessages?.()}
                        >
                          <ExternalLink size={16} />
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className='px-4 py-10 text-center text-slate-600'
                  >
                    {isLoading ? 'Loading...' : 'No orders found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className='border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-500'>
          Tip: click <span className='font-semibold text-slate-700'>View</span>{' '}
          to open the order details page.
        </div>
      </div>
    </div>
  );
}
