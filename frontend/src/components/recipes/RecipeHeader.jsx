import { ArrowLeft, CookingPot } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecipeHeader({ recipe }) {
  return (
    <div className='rounded-2xl border border-slate-200 bg-white p-5'>
      <Link
        to='/recipes'
        className='inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:underline'
      >
        <ArrowLeft size={18} />
        Back to recipes
      </Link>

      <div className='mt-3 flex items-center gap-2'>
        <CookingPot size={20} className='text-slate-500' />
        <h1 className='text-2xl font-extrabold text-slate-900'>
          {recipe?.name}
        </h1>
      </div>

      <p className='mt-2 text-sm text-slate-600'>
        {(recipe?.description || '').trim() || 'No description provided.'}
      </p>
    </div>
  );
}
