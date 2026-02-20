import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, ArrowUpDown } from 'lucide-react';

import { useProductsStore } from '../../stores/productsStore';
import ProductModal from './modals/ProductModal';

export default function AdminProductsTab() {
  const items = useProductsStore((s) => s.items);
  const count = useProductsStore((s) => s.count);

  const isLoading = useProductsStore((s) => s.isLoading);
  const error = useProductsStore((s) => s.error);
  const success = useProductsStore((s) => s.success);

  const search = useProductsStore((s) => s.search);
  const sort = useProductsStore((s) => s.sort);
  const dir = useProductsStore((s) => s.dir);

  const setQuery = useProductsStore((s) => s.setQuery);
  const clearMessages = useProductsStore((s) => s.clearMessages);

  const fetchProducts = useProductsStore((s) => s.fetchProducts);
  const deleteProduct = useProductsStore((s) => s.deleteProduct);

  const [localSearch, setLocalSearch] = useState(search || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const sortOptions = useMemo(
    () => [
      { value: 'created_at', label: 'Created' },
      { value: 'name', label: 'Name' },
      { value: 'unit', label: 'Unit' },
      { value: 'price', label: 'Price' },
      { value: 'stock', label: 'Stock' },
    ],
    [],
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setLocalSearch(search || '');
  }, [search]);

  function openCreate() {
    clearMessages();
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(p) {
    clearMessages();
    setEditing(p);
    setModalOpen(true);
  }

  async function onDelete(p) {
    clearMessages();
    const ok = window.confirm(`Delete product "${p.name}"?`);
    if (!ok) return;

    try {
      await deleteProduct(p.id);
    } catch {}
  }

  function applySearch() {
    clearMessages();
    setQuery({ search: localSearch });
    fetchProducts({ search: localSearch, sort, dir });
  }

  function resetSearch() {
    clearMessages();
    setLocalSearch('');
    setQuery({ search: '' });
    fetchProducts({ search: '', sort, dir });
  }

  function changeSort(nextSort) {
    clearMessages();
    setQuery({ sort: nextSort });
    fetchProducts({ search, sort: nextSort, dir });
  }

  function toggleDir() {
    const next = dir === 'asc' ? 'desc' : 'asc';
    clearMessages();
    setQuery({ dir: next });
    fetchProducts({ search, sort, dir: next });
  }

  return (
    <div>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <div className='text-lg font-extrabold text-slate-900'>Products</div>
          <p className='mt-1 text-sm text-slate-600'>
            Create, update and delete products.
          </p>
        </div>

        <button
          onClick={openCreate}
          className='inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700'
        >
          <Plus size={18} />
          Add New Product
        </button>
      </div>

      {/* Messages */}
      {error ? (
        <div className='mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
          {error}
        </div>
      ) : null}
      {success ? (
        <div className='mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700'>
          {success}
        </div>
      ) : null}

      {/* Toolbar */}
      <div className='mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4'>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
          <div className='flex flex-1 flex-col gap-2 sm:flex-row sm:items-center'>
            <div className='flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-red-200'>
              <Search size={18} className='text-slate-500' />
              <input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => (e.key === 'Enter' ? applySearch() : null)}
                className='w-full bg-transparent text-sm outline-none'
                placeholder='Search by name...'
              />
            </div>

            <div className='flex items-center gap-2'>
              <button
                onClick={applySearch}
                className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50'
              >
                Apply
              </button>
              <button
                onClick={resetSearch}
                className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50'
              >
                Reset
              </button>
            </div>
          </div>

          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end'>
            <div className='text-xs font-bold uppercase tracking-wide text-slate-500'>
              Sort
            </div>

            <select
              value={sort}
              onChange={(e) => changeSort(e.target.value)}
              className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-red-200'
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <button
              onClick={toggleDir}
              className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50'
              title='Toggle direction'
            >
              <ArrowUpDown size={18} />
              {dir === 'asc' ? 'Asc' : 'Desc'}
            </button>
          </div>
        </div>

        <div className='mt-3 text-xs text-slate-600'>
          Showing <span className='font-semibold'>{count}</span> product(s)
        </div>
      </div>

      {/* Table */}
      <div className='mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white'>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-185 text-left'>
            <thead className='bg-slate-50'>
              <tr className='text-xs font-extrabold uppercase tracking-wide text-slate-600'>
                <th className='px-4 py-3'>Name</th>
                <th className='px-4 py-3'>Unit</th>
                <th className='px-4 py-3'>Price</th>
                <th className='px-4 py-3'>Stock</th>
                <th className='px-4 py-3 text-right'>Actions</th>
              </tr>
            </thead>

            <tbody className='divide-y divide-slate-200'>
              {isLoading ? (
                <tr>
                  <td className='px-4 py-5 text-sm text-slate-600' colSpan={5}>
                    Loading products...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((p) => (
                  <tr key={p.id} className='text-sm'>
                    <td className='px-4 py-4'>
                      <div className='font-extrabold text-slate-900'>
                        {p.name}
                      </div>
                      <div className='mt-0.5 text-xs text-slate-500'>
                        ID: {p.id}
                      </div>
                    </td>

                    <td className='px-4 py-4 text-slate-700'>
                      {p.unit || '—'}
                    </td>

                    <td className='px-4 py-4 text-slate-700'>
                      ${p.price || '0.00'}
                    </td>

                    <td className='px-4 py-4'>
                      <span
                        className={[
                          'inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold',
                          Number(p.stock) > 0
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700',
                        ].join(' ')}
                      >
                        {p.stock}
                      </span>
                    </td>

                    <td className='px-4 py-4'>
                      <div className='flex justify-end gap-2'>
                        <button
                          onClick={() => openEdit(p)}
                          className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50'
                        >
                          <Pencil size={18} />
                          Edit
                        </button>

                        <button
                          onClick={() => onDelete(p)}
                          className='inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50'
                        >
                          <Trash2 size={18} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className='px-4 py-10 text-center text-sm text-slate-600'
                    colSpan={5}
                  >
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editing}
      />
    </div>
  );
}
