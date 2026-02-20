import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, CalendarDays, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import { useAdminOverviewStore } from '../../stores/adminOverviewStore';
import { useMoney } from '../../utils/helpers';

function Card({ title, value, subtitle }) {
  return (
    <div className='rounded-2xl border border-slate-200 bg-white p-4'>
      <div className='text-xs font-extrabold uppercase tracking-wide text-slate-500'>
        {title}
      </div>
      <div className='mt-2 text-2xl font-extrabold text-slate-900'>{value}</div>
      {subtitle ? (
        <div className='mt-1 text-xs text-slate-600'>{subtitle}</div>
      ) : null}
    </div>
  );
}

const PIE_COLORS = [
  '#ef4444',
  '#22c55e',
  '#3b82f6',
  '#a855f7',
  '#f59e0b',
  '#64748b',
];

export default function AdminOverviewTab() {
  const data = useAdminOverviewStore((s) => s.data);
  const isLoading = useAdminOverviewStore((s) => s.isLoading);
  const error = useAdminOverviewStore((s) => s.error);
  const days = useAdminOverviewStore((s) => s.days);
  const lowStock = useAdminOverviewStore((s) => s.lowStock);

  const setQuery = useAdminOverviewStore((s) => s.setQuery);
  const fetchOverview = useAdminOverviewStore((s) => s.fetchOverview);
  const clearMessages = useAdminOverviewStore((s) => s.clearMessages);

  useEffect(() => {
    fetchOverview();
  }, []);

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const tables = data?.tables || {};

  const revenueByDay = useMemo(() => {
    return (charts.revenue_by_day || []).map((x) => ({
      day: x.day,
      revenue: Number(x.revenue || 0),
    }));
  }, [charts]);

  const ordersByDay = useMemo(() => {
    return (charts.orders_by_day || []).map((x) => ({
      day: x.day,
      count: Number(x.count || 0),
    }));
  }, [charts]);

  const ordersByStatus = useMemo(() => {
    return (charts.orders_by_status || []).map((x) => ({
      status: x.status,
      count: Number(x.count || 0),
    }));
  }, [charts]);

  const topByRevenue = useMemo(() => {
    return (charts.top_products_by_revenue || []).map((x) => ({
      name: x.name,
      revenue: Number(x.revenue || 0),
    }));
  }, [charts]);

  const lowStockItems = tables.low_stock_items || [];

  const totalRevenueLabel = `$${Number(kpis.total_revenue || 0)}`;

  function handleRefresh() {
    clearMessages();
    fetchOverview();
  }

  function onApplyFilters(e) {
    e.preventDefault();
    clearMessages();
    fetchOverview({ days, lowStock });
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <div className='text-lg font-extrabold text-slate-900'>Overview</div>
          <div className='mt-1 text-sm text-slate-600'>
            KPIs and charts for the last {days} day(s).
          </div>
        </div>

        <button
          onClick={handleRefresh}
          type='button'
          className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50'
          disabled={isLoading}
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <form
        onSubmit={onApplyFilters}
        className='rounded-2xl border border-slate-200 bg-white p-4'
      >
        <div className='grid gap-3 md:grid-cols-3'>
          <div>
            <label className='text-sm font-semibold text-slate-800'>
              Range (days)
            </label>
            <div className='mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2'>
              <CalendarDays size={18} className='text-slate-500' />
              <input
                type='number'
                min={7}
                max={365}
                value={days}
                onChange={(e) =>
                  setQuery({ days: Number(e.target.value || 30) })
                }
                className='w-full bg-transparent text-sm outline-none'
              />
            </div>
          </div>

          <div>
            <label className='text-sm font-semibold text-slate-800'>
              Low stock threshold
            </label>
            <div className='mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2'>
              <AlertTriangle size={18} className='text-slate-500' />
              <input
                type='number'
                min={0}
                max={10000}
                value={lowStock}
                onChange={(e) =>
                  setQuery({ lowStock: Number(e.target.value || 0) })
                }
                className='w-full bg-transparent text-sm outline-none'
              />
            </div>
          </div>

          <div className='flex items-end'>
            <button
              type='submit'
              disabled={isLoading}
              className='inline-flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60'
            >
              Apply
            </button>
          </div>
        </div>
      </form>

      {/* Error */}
      {error ? (
        <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
          {error}
        </div>
      ) : null}

      {/* KPIs */}
      <div className='grid gap-3 md:grid-cols-3'>
        <Card title='Users' value={kpis.users ?? 0} />
        <Card title='Products' value={kpis.products ?? 0} />
        <Card title='Recipes' value={kpis.recipes ?? 0} />
        <Card title='Orders' value={kpis.orders ?? 0} />
        <Card
          title='Low stock'
          value={kpis.low_stock_count ?? 0}
          subtitle={`≤ ${lowStock}`}
        />
        <Card
          title='Total revenue'
          value={totalRevenueLabel}
          subtitle='PAID + COMPLETED'
        />
      </div>

      {/* Charts */}
      <div className='grid gap-4 lg:grid-cols-2'>
        {/* Revenue line */}
        <div className='rounded-2xl border border-slate-200 bg-white p-4'>
          <div className='text-sm font-extrabold text-slate-900'>
            Revenue by day
          </div>
          <div className='mt-3 h-72'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={revenueByDay}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='day' tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type='monotone'
                  dataKey='revenue'
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by status pie */}
        <div className='rounded-2xl border border-slate-200 bg-white p-4'>
          <div className='text-sm font-extrabold text-slate-900'>
            Orders by status
          </div>
          <div className='mt-3 h-72'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  dataKey='count'
                  nameKey='status'
                  outerRadius={90}
                  label
                >
                  {ordersByStatus.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={PIE_COLORS[idx % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by day bar */}
        <div className='rounded-2xl border border-slate-200 bg-white p-4'>
          <div className='text-sm font-extrabold text-slate-900'>
            Orders by day
          </div>
          <div className='mt-3 h-72'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={ordersByDay}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='day' tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey='count' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top products by revenue */}
        <div className='rounded-2xl border border-slate-200 bg-white p-4'>
          <div className='text-sm font-extrabold text-slate-900'>
            Top products by revenue
          </div>
          <div className='mt-3 h-72'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={topByRevenue}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='name'
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-20}
                  textAnchor='end'
                  height={70}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey='revenue' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Low stock table */}
      <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
        <div className='px-4 py-3'>
          <div className='text-sm font-extrabold text-slate-900'>
            Low stock items
          </div>
          <div className='mt-0.5 text-xs text-slate-600'>
            Showing up to 20 products with stock ≤ {lowStock}
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-225 w-full text-left text-sm'>
            <thead className='bg-slate-50 text-slate-700'>
              <tr>
                <th className='px-4 py-3 font-extrabold'>ID</th>
                <th className='px-4 py-3 font-extrabold'>Name</th>
                <th className='px-4 py-3 font-extrabold'>Stock</th>
                <th className='px-4 py-3 font-extrabold'>Unit</th>
                <th className='px-4 py-3 font-extrabold'>Price</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-200'>
              {lowStockItems.length ? (
                lowStockItems.map((p) => (
                  <tr key={p.id} className='hover:bg-slate-50/60'>
                    <td className='px-4 py-3 text-slate-600'>{p.id}</td>
                    <td className='px-4 py-3'>
                      <div className='font-extrabold text-slate-900'>
                        {p.name}
                      </div>
                    </td>
                    <td className='px-4 py-3 font-semibold text-slate-800'>
                      {p.stock}
                    </td>
                    <td className='px-4 py-3 text-slate-700'>
                      {p.unit || '-'}
                    </td>
                    <td className='px-4 py-3 text-slate-700'>
                      ${Number(p.price || 0)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className='px-4 py-8 text-center text-slate-600'
                  >
                    {isLoading ? 'Loading...' : 'No low stock products.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
