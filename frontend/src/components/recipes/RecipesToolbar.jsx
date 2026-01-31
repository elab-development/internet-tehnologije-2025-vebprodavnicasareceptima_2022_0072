import { Search, ArrowUpDown, Filter } from 'lucide-react';

export default function RecipesToolbar({
  search,
  sort,
  dir,
  productId,
  products,
  onSearchChange,
  onSortChange,
  onDirToggle,
  onProductChange,
  onSubmit,
  isLoading,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className='rounded-2xl border border-slate-200 bg-white p-4'
    >
      <div className='flex flex-col gap-3 md:flex-row md:items-end'>
        <div className='flex-1'>
          <label className='text-sm font-semibold text-slate-800'>Search</label>
          <div className='mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-red-200'>
            <Search size={18} className='text-slate-500' />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className='w-full bg-transparent text-sm outline-none'
              placeholder='Search name, description, ingredients...'
            />
          </div>
        </div>

        <div className='w-full md:w-56'>
          <label className='text-sm font-semibold text-slate-800'>
            Sort by
          </label>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className='mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200'
          >
            <option value='name'>Name</option>
          </select>
        </div>

        <div className='w-full md:w-56'>
          <label className='text-sm font-semibold text-slate-800'>
            Filter by product
          </label>
          <div className='mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-red-200'>
            <Filter size={18} className='text-slate-500' />
            <select
              value={productId}
              onChange={(e) => onProductChange(e.target.value)}
              className='w-full bg-transparent text-sm outline-none'
            >
              <option value=''>All products</option>
              {(products || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='flex gap-2 md:justify-end'>
          <button
            type='button'
            onClick={onDirToggle}
            className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50'
            title='Toggle sort direction'
          >
            <ArrowUpDown size={18} />
            {dir === 'asc' ? 'ASC' : 'DESC'}
          </button>

          <button
            type='submit'
            disabled={isLoading}
            className='inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60'
          >
            {isLoading ? 'Loading...' : 'Apply'}
          </button>
        </div>
      </div>
    </form>
  );
}
