import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Search, X } from 'lucide-react';
import { useExternalRecipesStore } from '../../stores/externalRecipesStore';

function pickQueryFromRecipe(recipe) {
  const name = String(recipe?.name || '').trim();
  if (!name) return '';

  const stop = new Set([
    'and',
    'with',
    'the',
    'a',
    'an',
    'of',
    'for',
    'to',
    'in',
    'on',
    'recipe',
    'style',
    'homemade',
    'easy',
    'quick',
    'salad',
    'sauce',
    'soup',
    'cake',
  ]);

  const words = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const strong = words.find((w) => w.length >= 4 && !stop.has(w));
  return strong || words[0] || '';
}

function ExternalRecipeCard({ r }) {
  return (
    <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
      <div className='flex gap-4'>
        <div className='h-20 w-20 overflow-hidden rounded-xl bg-slate-100 shrink-0'>
          {r?.image ? (
            <img
              src={r.image}
              alt={r.title || 'Recipe'}
              className='h-full w-full object-cover'
              loading='lazy'
            />
          ) : null}
        </div>

        <div className='min-w-0 flex-1'>
          <div className='text-base font-extrabold text-slate-900 truncate'>
            {r?.title || 'Untitled'}
          </div>

          <div className='mt-1 flex flex-wrap gap-2 text-xs'>
            {r?.category ? (
              <span className='rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700'>
                {r.category}
              </span>
            ) : null}
            {r?.area ? (
              <span className='rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700'>
                {r.area}
              </span>
            ) : null}
          </div>

          <div className='mt-3 flex flex-wrap gap-2'>
            {r?.youtube ? (
              <a
                href={r.youtube}
                target='_blank'
                rel='noreferrer'
                className='inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700'
              >
                <ExternalLink size={18} />
                Watch
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExternalRecipesSection({ recipe }) {
  const items = useExternalRecipesStore((s) => s.items);
  const isLoading = useExternalRecipesStore((s) => s.isLoading);
  const error = useExternalRecipesStore((s) => s.error);
  const q = useExternalRecipesStore((s) => s.q);
  const search = useExternalRecipesStore((s) => s.search);
  const clear = useExternalRecipesStore((s) => s.clear);

  const autoQuery = useMemo(() => pickQueryFromRecipe(recipe), [recipe]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const next = autoQuery;
    setDraft(next);
    if (next) search(next);
    else clear();
  }, [autoQuery]);

  function onSubmit(e) {
    e.preventDefault();
    search(draft);
  }

  return (
    <div className='rounded-2xl border border-slate-200 bg-white p-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <div className='text-base font-extrabold text-slate-900'>
            External recipes
          </div>
          <div className='mt-1 text-sm text-slate-600'>
            Suggestions from TheMealDB {q ? `(query: "${q}")` : ''}.
          </div>
        </div>

        <form onSubmit={onSubmit} className='flex w-full gap-2 sm:w-auto'>
          <div className='flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-red-200 sm:w-80'>
            <Search size={18} className='text-slate-500' />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className='w-full bg-transparent text-sm outline-none'
              placeholder='Search external recipes...'
            />
          </div>

          <button
            type='button'
            onClick={() => {
              setDraft('');
              clear();
            }}
            className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50'
            title='Clear'
          >
            <X size={18} />
          </button>

          <button
            type='submit'
            className='inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700'
          >
            Search
          </button>
        </form>
      </div>

      {error ? (
        <div className='mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className='mt-4 text-sm text-slate-600'>
          Loading external recipes...
        </div>
      ) : !items?.length ? (
        <div className='mt-4 text-sm text-slate-600'>
          No external recipes found.
        </div>
      ) : (
        <div className='mt-5 grid gap-4 md:grid-cols-2'>
          {items.slice(0, 6).map((r) => (
            <ExternalRecipeCard key={`${r.source}-${r.external_id}`} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}
