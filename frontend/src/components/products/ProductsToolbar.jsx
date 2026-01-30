import { Search, ArrowUpDown } from 'lucide-react';

export default function ProductsToolbar({
  search,
  sort,
  dir,
  onSearchChange,
  onSortChange,
  onDirToggle,
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
              placeholder='Search by product name...'
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
            <option value='created_at'>Newest</option>
            <option value='name'>Name</option>
            <option value='price'>Price</option>
            <option value='stock'>Stock</option>
            <option value='unit'>Unit</option>
          </select>
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
