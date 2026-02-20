import { Package, CookingPot, ClipboardList, BarChart3 } from 'lucide-react';

function Item({ active, icon: Icon, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full text-left rounded-xl border px-4 py-3 transition',
        active
          ? 'border-red-200 bg-red-50'
          : 'border-slate-200 bg-white hover:bg-slate-50',
      ].join(' ')}
    >
      <div className='flex items-start gap-3'>
        <div
          className={[
            'mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl',
            active ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700',
          ].join(' ')}
        >
          <Icon size={18} />
        </div>

        <div className='min-w-0'>
          <div
            className={[
              'text-sm font-extrabold',
              active ? 'text-slate-900' : 'text-slate-900',
            ].join(' ')}
          >
            {title}
          </div>
          <div className='mt-0.5 text-xs text-slate-600'>{subtitle}</div>
        </div>
      </div>
    </button>
  );
}

export default function AdminSidebar({ tab, setTab }) {
  return (
    <aside className='rounded-2xl border border-slate-200 bg-white p-4'>
      <div className='text-xs font-extrabold uppercase tracking-wide text-slate-500'>
        Sections
      </div>

      <div className='mt-3 grid gap-2'>
        <Item
          active={tab === 'overview'}
          icon={BarChart3}
          title='Overview'
          subtitle='KPIs, charts and low stock'
          onClick={() => setTab('overview')}
        />

        <Item
          active={tab === 'products'}
          icon={Package}
          title='Products'
          subtitle='Create, update and delete products'
          onClick={() => setTab('products')}
        />
        <Item
          active={tab === 'recipes'}
          icon={CookingPot}
          title='Recipes'
          subtitle='Manage recipes and ingredients'
          onClick={() => setTab('recipes')}
        />
        <Item
          active={tab === 'orders'}
          icon={ClipboardList}
          title='Orders'
          subtitle='Track and update order statuses'
          onClick={() => setTab('orders')}
        />
      </div>
    </aside>
  );
}
