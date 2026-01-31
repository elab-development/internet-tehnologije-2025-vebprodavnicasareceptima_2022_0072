import { ShoppingCart, CheckCircle2 } from 'lucide-react';

export default function RecipeActions({
  canAddToCart,
  onAddWholeRecipe,
  addedMessage,
}) {
  return (
    <div className='rounded-2xl border border-slate-200 bg-white p-5'>
      <div className='text-base font-extrabold text-slate-900'>Actions</div>
      <div className='mt-1 text-sm text-slate-600'>
        Add the entire recipe as a suggested cart.
      </div>

      <button
        onClick={onAddWholeRecipe}
        disabled={!canAddToCart}
        className='mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60'
      >
        <ShoppingCart size={18} />
        Add whole recipe to cart
      </button>

      {!canAddToCart ? (
        <div className='mt-3 text-xs text-slate-500'>
          Log in as a user to add items to cart.
        </div>
      ) : null}

      {addedMessage ? (
        <div className='mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700'>
          <CheckCircle2 size={18} />
          {addedMessage}
        </div>
      ) : null}
    </div>
  );
}
