import { ShoppingCart, Package } from 'lucide-react';
import { useMoney } from '../../utils/helpers';

export default function ProductCard({ product, canAddToCart, onAddToCart }) {
  const stock = Number(product.stock ?? 0);
  const isOut = stock <= 0;
  const priceLabel = useMoney(product.price);

  return (
    <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <div className='flex items-center gap-2'>
            <Package size={18} className='text-slate-500' />
            <h3 className='text-base font-extrabold text-slate-900'>
              {product.name}
            </h3>
          </div>

          <div className='mt-1 text-sm text-slate-600'>
            Unit:{' '}
            <span className='font-semibold text-slate-800'>
              {product.unit || '-'}
            </span>
          </div>
        </div>

        <div className='text-right'>
          <div className='text-lg font-extrabold text-slate-900'>
            {priceLabel}
          </div>
          <div className='mt-1 text-xs text-slate-500'>
            Stock:{' '}
            <span
              className={
                isOut
                  ? 'font-semibold text-red-600'
                  : 'font-semibold text-slate-700'
              }
            >
              {stock}
            </span>
          </div>
        </div>
      </div>

      <div className='mt-4 flex items-center justify-between gap-2'>
        <div className='text-xs text-slate-500'>
          {isOut ? 'Out of stock' : 'Available'}
        </div>

        {canAddToCart ? (
          <button
            onClick={() => onAddToCart(product)}
            disabled={isOut}
            className='inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60'
          >
            <ShoppingCart size={18} />
            Add
          </button>
        ) : null}
      </div>
    </div>
  );
}
