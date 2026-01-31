import { Link } from 'react-router-dom';
import { CookingPot, ArrowRight } from 'lucide-react';

export default function RecipeCard({ recipe }) {
  const desc = (recipe.description || '').trim();
  const short =
    desc.length > 140 ? `${desc.slice(0, 140).trim()}...` : desc || '—';

  return (
    <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <div className='flex items-center gap-2'>
            <CookingPot size={18} className='text-slate-500' />
            <h3 className='truncate text-base font-extrabold text-slate-900'>
              {recipe.name}
            </h3>
          </div>
          <p className='mt-2 text-sm text-slate-600'>{short}</p>
        </div>
      </div>

      <div className='mt-4 flex justify-end'>
        <Link
          to={`/recipes/${recipe.id}`}
          className='inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700'
        >
          View details
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
