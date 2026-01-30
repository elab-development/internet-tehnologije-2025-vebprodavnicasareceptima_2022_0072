import { useEffect } from 'react';

import { useAuthStore } from '../stores/authStore';
import { useProductsStore } from '../stores/productsStore';
import { useCartStore } from '../stores/cartStore';

import ProductsToolbar from '../components/products/ProductsToolbar';
import ProductsList from '../components/products/ProductsList';

export default function Products() {
  const user = useAuthStore((s) => s.user);

  const {
    items,
    isLoading,
    error,
    search,
    sort,
    dir,
    setQuery,
    clearMessages,
    fetchProducts,
  } = useProductsStore();

  const addItem = useCartStore((s) => s.addItem);

  const role = (user?.role || '').toLowerCase();
  const canAddToCart = role === 'user';

  useEffect(() => {
    fetchProducts();
  }, []);

  function onSubmit(e) {
    e.preventDefault();
    clearMessages();
    fetchProducts({ search, sort, dir });
  }

  function handleAdd(product) {
    addItem(product, 1);
  }

  return (
    <div className='mx-auto max-w-6xl px-4 py-10'>
      <div className='flex items-end justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-extrabold text-slate-900'>Products</h1>
          <p className='mt-1 text-sm text-slate-600'>
            Search and sort products.{' '}
            {canAddToCart
              ? 'Add items directly to your cart.'
              : 'Log in as a user to add to cart.'}
          </p>
        </div>
      </div>

      <div className='mt-5'>
        <ProductsToolbar
          search={search}
          sort={sort}
          dir={dir}
          isLoading={isLoading}
          onSearchChange={(v) => setQuery({ search: v })}
          onSortChange={(v) => setQuery({ sort: v })}
          onDirToggle={() => setQuery({ dir: dir === 'asc' ? 'desc' : 'asc' })}
          onSubmit={onSubmit}
        />
      </div>

      {error ? (
        <div className='mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
          {error}
        </div>
      ) : null}

      <div className='mt-6'>
        <ProductsList
          items={items}
          isLoading={isLoading}
          canAddToCart={canAddToCart}
          onAddToCart={handleAdd}
        />
      </div>
    </div>
  );
}
