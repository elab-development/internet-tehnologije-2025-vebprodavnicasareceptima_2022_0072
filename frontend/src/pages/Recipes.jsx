import { useEffect } from 'react';
import { useRecipesStore } from '../stores/recipesStore';
import { useProductsStore } from '../stores/productsStore';

import RecipesToolbar from '../components/recipes/RecipesToolbar';
import RecipesList from '../components/recipes/RecipesList';

export default function Recipes() {
  const {
    items,
    isLoading,
    error,
    search,
    sort,
    dir,
    productId,
    setQuery,
    clearMessages,
    fetchRecipes,
  } = useRecipesStore();

  const products = useProductsStore((s) => s.items);
  const fetchProducts = useProductsStore((s) => s.fetchProducts);

  useEffect(() => {
    fetchProducts();
    fetchRecipes();
  }, []);

  function onSubmit(e) {
    e.preventDefault();
    clearMessages();
    fetchRecipes({ search, sort, dir, productId });
  }

  return (
    <div className='mx-auto max-w-6xl px-4 py-10'>
      <div>
        <h1 className='text-2xl font-extrabold text-slate-900'>Recipes</h1>
        <p className='mt-1 text-sm text-slate-600'>
          Search recipes by name, description, or ingredient. Filter recipes by
          a product.
        </p>
      </div>

      <div className='mt-5'>
        <RecipesToolbar
          search={search}
          sort={sort}
          dir={dir}
          productId={productId}
          products={products}
          isLoading={isLoading}
          onSearchChange={(v) => setQuery({ search: v })}
          onSortChange={(v) => setQuery({ sort: v })}
          onDirToggle={() => setQuery({ dir: dir === 'asc' ? 'desc' : 'asc' })}
          onProductChange={(v) => setQuery({ productId: v })}
          onSubmit={onSubmit}
        />
      </div>

      {error ? (
        <div className='mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
          {error}
        </div>
      ) : null}

      <div className='mt-6'>
        <RecipesList items={items} isLoading={isLoading} />
      </div>
    </div>
  );
}
