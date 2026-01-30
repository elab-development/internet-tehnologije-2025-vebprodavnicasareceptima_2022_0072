import ProductCard from './ProductCard';

export default function ProductsList({
  items,
  canAddToCart,
  onAddToCart,
  isLoading,
}) {
  if (isLoading) {
    return (
      <div className='rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600'>
        Loading products...
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className='rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600'>
        No products found.
      </div>
    );
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {items.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          canAddToCart={canAddToCart}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
