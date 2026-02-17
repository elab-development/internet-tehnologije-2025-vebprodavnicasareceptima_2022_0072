import { Plus } from 'lucide-react';
import { useMoney } from '../../utils/helpers';

function IngredientRow({ ri, p, canAddToCart, onAddIngredient }) {
  const stock = p ? Number(p.stock ?? 0) : null;
  const priceLabel = useMoney(p?.price ?? 0);

  return (
    <tr className='text-slate-700'>
      <td className='px-5 py-3 font-semibold text-slate-900'>
        {ri.product_name || p?.name || `#${ri.product_id}`}
      </td>
      <td className='px-5 py-3'>
        {ri.quantity} {ri.unit || ''}
      </td>
      <td className='px-5 py-3'>{p?.unit || '-'}</td>

      <td className='px-5 py-3'>{p ? priceLabel : '-'}</td>

      <td className='px-5 py-3'>
        {p ? (
          <span
            className={
              stock <= 0 ? 'font-semibold text-red-600' : 'font-semibold'
            }
          >
            {stock}
          </span>
        ) : (
          '-'
        )}
      </td>

      <td className='px-5 py-3 text-right'>
        {canAddToCart ? (
          <button
            onClick={() => onAddIngredient(ri, p)}
            disabled={!p || (stock !== null && stock <= 0)}
            className='inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60'
            title='Add this ingredient to cart'
          >
            <Plus size={16} />
            Add
          </button>
        ) : (
          <span className='text-xs text-slate-400'>—</span>
        )}
      </td>
    </tr>
  );
}

export default function IngredientsTable({
  ingredients,
  productsById,
  canAddToCart,
  onAddIngredient,
}) {
  if (!ingredients?.length) {
    return (
      <div className='rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600'>
        No ingredients found for this recipe.
      </div>
    );
  }

  return (
    <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
      <div className='border-b border-slate-200 px-5 py-4'>
        <div className='text-base font-extrabold text-slate-900'>
          Ingredients
        </div>
        <div className='mt-1 text-sm text-slate-600'>
          {canAddToCart
            ? 'Add single ingredients to cart.'
            : 'Log in as a user to add ingredients to cart.'}
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead className='bg-slate-50 text-slate-600'>
            <tr>
              <th className='px-5 py-3 text-left font-semibold'>Product</th>
              <th className='px-5 py-3 text-left font-semibold'>Recipe qty</th>
              <th className='px-5 py-3 text-left font-semibold'>Shop unit</th>
              <th className='px-5 py-3 text-left font-semibold'>Price</th>
              <th className='px-5 py-3 text-left font-semibold'>Stock</th>
              <th className='px-5 py-3 text-right font-semibold'>Actions</th>
            </tr>
          </thead>

          <tbody className='divide-y divide-slate-200'>
            {ingredients.map((ri) => {
              const p = productsById?.get?.(ri.product_id) || null;
              return (
                <IngredientRow
                  key={ri.id}
                  ri={ri}
                  p={p}
                  canAddToCart={canAddToCart}
                  onAddIngredient={onAddIngredient}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
