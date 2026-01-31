import RecipeCard from './RecipeCard';

export default function RecipesList({ items, isLoading }) {
  if (isLoading) {
    return (
      <div className='rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600'>
        Loading recipes...
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className='rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600'>
        No recipes found.
      </div>
    );
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {items.map((r) => (
        <RecipeCard key={r.id} recipe={r} />
      ))}
    </div>
  );
}
