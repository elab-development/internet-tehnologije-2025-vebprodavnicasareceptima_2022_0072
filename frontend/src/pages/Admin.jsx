import { useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminProductsTab from '../components/admin/AdminProductsTab';
import AdminRecipesTab from '../components/admin/AdminRecipesTab';
import AdminOrdersTab from '../components/admin/AdminOrdersTab';
import AdminOverviewTab from '../components/admin/AdminOverviewTab';

const TABS = ['overview', 'products', 'recipes', 'orders'];

export default function Admin() {
  const [tab, setTab] = useState('overview');

  return (
    <div className='mx-auto max-w-6xl px-4 py-8'>
      <div className='mb-6'>
        <h1 className='text-2xl font-extrabold text-slate-900'>
          Admin Dashboard
        </h1>
        <p className='mt-1 text-sm text-slate-600'>
          Overview, products, recipes and orders.
        </p>
      </div>

      <div className='grid gap-6 lg:grid-cols-12'>
        <div className='lg:col-span-3'>
          <AdminSidebar tab={tab} setTab={setTab} tabs={TABS} />
        </div>

        <div className='lg:col-span-9'>
          <div className='rounded-2xl border border-slate-200 bg-white p-5'>
            {tab === 'overview' ? <AdminOverviewTab /> : null}
            {tab === 'products' ? <AdminProductsTab /> : null}
            {tab === 'recipes' ? <AdminRecipesTab /> : null}
            {tab === 'orders' ? <AdminOrdersTab /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
