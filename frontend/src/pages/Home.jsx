import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className='mx-auto max-w-6xl px-4 py-10'>
      <div className='rounded-2xl border border-slate-200 bg-slate-50 p-8'>
        <h1 className='text-3xl font-extrabold text-slate-900'>
          Find a recipe, build a cart, order ingredients.
        </h1>
        <p className='mt-3 max-w-2xl text-slate-600'>
          Search recipes by ingredients and automatically generate a suggested
          cart you can edit before checkout.
        </p>

        <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
          <Link
            to='/recipes'
            className='inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700'
          >
            Browse recipes <ArrowRight size={18} />
          </Link>

          <Link
            to='/products'
            className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50'
          >
            View products
          </Link>
        </div>
      </div>

      <div className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <div className='rounded-2xl border border-slate-200 bg-white p-6'>
          <div className='text-sm font-semibold text-slate-900'>
            Recipe search
          </div>
          <div className='mt-2 text-sm text-slate-600'>
            Find recipes by name, description, or ingredients.
          </div>
        </div>

        <div className='rounded-2xl border border-slate-200 bg-white p-6'>
          <div className='text-sm font-semibold text-slate-900'>
            Suggested cart
          </div>
          <div className='mt-2 text-sm text-slate-600'>
            Generate a cart from a recipe and adjust quantities before ordering.
          </div>
        </div>

        <div className='rounded-2xl border border-slate-200 bg-white p-6'>
          <div className='text-sm font-semibold text-slate-900'>Orders</div>
          <div className='mt-2 text-sm text-slate-600'>
            Track your orders and view order details anytime.
          </div>
        </div>
      </div>
    </div>
  );
}
