import { useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw, Search, ArrowUpDown, Filter } from 'lucide-react';

import { useRecipesStore } from '../../stores/recipesStore';
import { useProductsStore } from '../../stores/productsStore';

import RecipeModal from './modals/RecipeModal';

function SortPill({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition',
        active
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
      ].join(' ')}
      type='button'
    >
      <ArrowUpDown size={16} />
      {children}
    </button>
  );
}

export default function AdminRecipesTab() {
  const items = useRecipesStore((s) => s.items);
  const count = useRecipesStore((s) => s.count);
  const isLoading = useRecipesStore((s) => s.isLoading);
  const error = useRecipesStore((s) => s.error);

  const search = useRecipesStore((s) => s.search);
  const sort = useRecipesStore((s) => s.sort);
  const dir = useRecipesStore((s) => s.dir);
  const productId = useRecipesStore((s) => s.productId);

  const setQuery = useRecipesStore((s) => s.setQuery);
  const fetchRecipes = useRecipesStore((s) => s.fetchRecipes);
  const deleteRecipe = useRecipesStore((s) => s.deleteRecipe);
  const clearMessages = useRecipesStore((s) => s.clearMessages);

  const products = useProductsStore((s) => s.items);
  const fetchProducts = useProductsStore((s) => s.fetchProducts);

  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchRecipes();
    fetchProducts();
  }, []);

  const productOptions = useMemo(() => {
    return [{ id: '', name: 'All products' }, ...(products || [])];
  }, [products]);

  function openCreate() {
    clearMessages?.();
    setSelected(null);
    setOpenModal(true);
  }

  function openEdit(r) {
    clearMessages?.();
    setSelected(r);
    setOpenModal(true);
  }

  async function onDelete(r) {
    const ok = window.confirm(`Delete recipe "${r.name}"?`);
    if (!ok) return;
    try {
      await deleteRecipe(r.id);
    } catch {}
  }

  function toggleDir() {
    setQuery({ dir: dir === 'asc' ? 'desc' : 'asc' });
    fetchRecipes({ dir: dir === 'asc' ? 'desc' : 'asc' });
  }

  function setSortName() {
    setQuery({ sort: 'name' });
    fetchRecipes({ sort: 'name' });
  }

  function onSearchSubmit(e) {
    e.preventDefault();
    fetchRecipes({ search });
  }

  function onChangeFilterProduct(e) {
    const next = e.target.value;
    setQuery({ productId: next });
    fetchRecipes({ productId: next });
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <div className='text-lg font-extrabold text-slate-900'>Recipes</div>
          <div className='mt-1 text-sm text-slate-600'>
            Manage recipes and their ingredients. ({count} total)
          </div>
        </div>

        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
          <button
            onClick={() => fetchRecipes()}
            type='button'
            className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50'
            disabled={isLoading}
            title='Refresh'
          >
            <RefreshCw size={18} />
            Refresh
          </button>

          <button
            onClick={openCreate}
            type='button'
            className='inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60'
            disabled={isLoading}
          >
            <Plus size={18} />
            Add new recipe
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className='rounded-2xl border border-slate-200 bg-white p-4'>
        <div className='grid gap-3 md:grid-cols-3'>
          {/* Search */}
          <form onSubmit={onSearchSubmit} className='md:col-span-2'>
            <label className='text-sm font-semibold text-slate-800'>
              Search
            </label>
            <div className='mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-red-200'>
              <Search size={18} className='text-slate-500' />
              <input
                value={search}
                onChange={(e) => setQuery({ search: e.target.value })}
                className='w-full bg-transparent text-sm outline-none'
                placeholder='Search by name, description or ingredient...'
              />
              <button
                type='submit'
                className='rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700'
              >
                Search
              </button>
            </div>
          </form>

          {/* Filter by product */}
          <div>
            <label className='text-sm font-semibold text-slate-800'>
              Filter by product
            </label>
            <div className='mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2'>
              <Filter size={18} className='text-slate-500' />
              <select
                value={productId || ''}
                onChange={onChangeFilterProduct}
                className='w-full bg-transparent text-sm outline-none'
              >
                {productOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className='mt-3 flex flex-wrap items-center gap-2'>
          <SortPill active={sort === 'name'} onClick={setSortName}>
            Sort: Name
          </SortPill>

          <button
            onClick={toggleDir}
            type='button'
            className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50'
          >
            <ArrowUpDown size={16} />
            Direction: {dir.toUpperCase()}
          </button>

          <button
            type='button'
            onClick={() => {
              setQuery({ search: '', productId: '', sort: 'name', dir: 'asc' });
              fetchRecipes({
                search: '',
                productId: '',
                sort: 'name',
                dir: 'asc',
              });
            }}
            className='ml-auto inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50'
          >
            Reset
          </button>
        </div>
      </div>

      {/* Error */}
      {error ? (
        <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
          {error}
        </div>
      ) : null}

      {/* Table */}
      <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
        <div className='overflow-x-auto'>
          <table className='min-w-225 w-full text-left text-sm'>
            <thead className='bg-slate-50 text-slate-700'>
              <tr>
                <th className='px-4 py-3 font-extrabold'>ID</th>
                <th className='px-4 py-3 font-extrabold'>Name</th>
                <th className='px-4 py-3 font-extrabold'>Description</th>
                <th className='px-4 py-3 font-extrabold'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-200'>
              {items?.length ? (
                items.map((r) => (
                  <tr key={r.id} className='hover:bg-slate-50/60'>
                    <td className='px-4 py-3 text-slate-600'>{r.id}</td>
                    <td className='px-4 py-3'>
                      <div className='font-extrabold text-slate-900'>
                        {r.name}
                      </div>
                    </td>
                    <td className='px-4 py-3 text-slate-700'>
                      <div className='max-w-130 truncate'>
                        {r.description || '-'}
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => openEdit(r)}
                          type='button'
                          className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(r)}
                          type='button'
                          className='rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100'
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className='px-4 py-10 text-center text-slate-600'
                  >
                    {isLoading ? 'Loading...' : 'No recipes found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <RecipeModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        recipe={selected}
      />
    </div>
  );
}
