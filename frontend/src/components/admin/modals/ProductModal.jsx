import { useEffect, useMemo, useState } from 'react';
import {
  X,
  Save,
  PlusCircle,
  Tag,
  Ruler,
  DollarSign,
  Boxes,
} from 'lucide-react';
import { useProductsStore } from '../../../stores/productsStore';

export default function ProductModal({ open, onClose, product }) {
  const createProduct = useProductsStore((s) => s.createProduct);
  const updateProduct = useProductsStore((s) => s.updateProduct);
  const isLoading = useProductsStore((s) => s.isLoading);
  const error = useProductsStore((s) => s.error);
  const clearMessages = useProductsStore((s) => s.clearMessages);

  const isEdit = useMemo(() => Boolean(product?.id), [product]);

  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;

    clearMessages();
    setTouched(false);

    if (product) {
      setName(product.name || '');
      setUnit(product.unit || '');
      setPrice(product.price ?? '');
      setStock(String(product.stock ?? 0));
    } else {
      setName('');
      setUnit('');
      setPrice('');
      setStock('0');
    }
  }, [open, product?.id]);

  const nameErr = useMemo(() => {
    //if (!touched) return '';
    if (!name.trim()) return 'Name is required.';
    return '';
  }, [touched, name]);

  const unitErr = useMemo(() => {
    //if (!touched) return '';
    if ((unit || '').trim().length > 50)
      return 'Unit must be at most 50 characters.';
    return '';
  }, [touched, unit]);

  const priceErr = useMemo(() => {
    //if (!touched) return '';
    const p = Number(price);
    if (!Number.isFinite(p) || p <= 0) return 'Price must be a number > 0.';
    return '';
  }, [touched, price]);

  const stockErr = useMemo(() => {
    //if (!touched) return '';
    const s = Number(stock);
    if (!Number.isInteger(s) || s < 0) return 'Stock must be an integer >= 0.';
    return '';
  }, [touched, stock]);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if ((unit || '').trim().length > 50) return false;

    const p = Number(price);
    if (!Number.isFinite(p) || p <= 0) return false;

    const s = Number(stock);
    if (!Number.isInteger(s) || s < 0) return false;

    return true;
  }, [name, unit, price, stock]);

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    setTouched(true);
    clearMessages();

    if (!canSubmit) return;

    const payload = {
      name: name.trim(),
      unit: unit.trim(),
      price: Number(price),
      stock: Number(stock),
    };

    try {
      if (isEdit) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }
      onClose();
    } catch {}
  }

  return (
    <div
      className='fixed inset-0 z-100 flex items-center justify-center p-4'
      role='dialog'
      aria-modal='true'
    >
      {/* Backdrop */}
      <button
        onClick={onClose}
        className='absolute inset-0 bg-black/40'
        aria-label='Close'
      />

      <div className='relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-slate-200 px-5 py-4'>
          <div className='min-w-0'>
            <div className='text-base font-extrabold text-slate-900'>
              {isEdit ? 'Edit product' : 'Add new product'}
            </div>
            <div className='mt-0.5 text-sm text-slate-600'>
              {isEdit
                ? 'Update product data and save changes.'
                : 'Fill in product details and create it.'}
            </div>
          </div>

          <button
            onClick={onClose}
            className='inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            aria-label='Close modal'
            disabled={isLoading}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className='p-5 space-y-4'>
          {error ? (
            <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
              {error}
            </div>
          ) : null}

          {/* Name */}
          <div>
            <label className='text-sm font-semibold text-slate-800'>Name</label>
            <div className='mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-red-200'>
              <Tag size={18} className='text-slate-500' />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full bg-transparent text-sm outline-none'
                placeholder='e.g. Tomatoes'
                maxLength={180}
              />
            </div>
            {nameErr ? (
              <div className='mt-1 text-xs font-semibold text-red-600'>
                {nameErr}
              </div>
            ) : null}
          </div>

          {/* Unit */}
          <div>
            <label className='text-sm font-semibold text-slate-800'>Unit</label>
            <div className='mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-red-200'>
              <Ruler size={18} className='text-slate-500' />
              <input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className='w-full bg-transparent text-sm outline-none'
                placeholder='e.g. 250g / 1L / pack'
                maxLength={50}
              />
            </div>
            {unitErr ? (
              <div className='mt-1 text-xs font-semibold text-red-600'>
                {unitErr}
              </div>
            ) : (
              <div className='mt-1 text-xs text-slate-500'>
                Optional, max 50 characters.
              </div>
            )}
          </div>

          <div className='grid gap-3 sm:grid-cols-2'>
            {/* Price */}
            <div>
              <label className='text-sm font-semibold text-slate-800'>
                Price
              </label>
              <div className='mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-red-200'>
                <DollarSign size={18} className='text-slate-500' />
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className='w-full bg-transparent text-sm outline-none'
                  placeholder='e.g. 199.99'
                  inputMode='decimal'
                />
              </div>
              {priceErr ? (
                <div className='mt-1 text-xs font-semibold text-red-600'>
                  {priceErr}
                </div>
              ) : null}
            </div>

            {/* Stock */}
            <div>
              <label className='text-sm font-semibold text-slate-800'>
                Stock
              </label>
              <div className='mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-red-200'>
                <Boxes size={18} className='text-slate-500' />
                <input
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className='w-full bg-transparent text-sm outline-none'
                  placeholder='0'
                  inputMode='numeric'
                />
              </div>
              {stockErr ? (
                <div className='mt-1 text-xs font-semibold text-red-600'>
                  {stockErr}
                </div>
              ) : null}
            </div>
          </div>

          {/* Footer actions */}
          <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
            <button
              type='button'
              onClick={onClose}
              className='inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50'
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              type='submit'
              disabled={!canSubmit || isLoading}
              className='inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60'
            >
              {isEdit ? <Save size={18} /> : <PlusCircle size={18} />}
              {isLoading
                ? 'Saving...'
                : isEdit
                  ? 'Save changes'
                  : 'Create product'}
            </button>
          </div>

          <div className='text-xs text-slate-500'>
            {isEdit
              ? 'Changes are applied immediately after saving.'
              : 'Product name must be unique.'}
          </div>
        </form>
      </div>
    </div>
  );
}
