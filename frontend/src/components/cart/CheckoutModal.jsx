import {
  X,
  CreditCard,
  MapPin,
  Phone,
  User,
  ClipboardList,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { useMoney } from '../../utils/helpers';

export default function CheckoutModal({
  open,
  onClose,
  items,
  total,
  isLoading,
  error,
  onConfirm,
}) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState(false);

  const totalLabel = useMoney(total);

  const canSubmit = useMemo(() => {
    if (!items?.length) return false;
    if (!customerName.trim()) return false;
    if (!phone.trim()) return false;
    if (!address.trim()) return false;
    return true;
  }, [items, customerName, phone, address]);

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    await onConfirm({
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      note: note.trim(),
    });
  }

  return (
    <div
      className='fixed inset-0 z-100 flex items-center justify-center p-4'
      role='dialog'
      aria-modal='true'
    >
      <button
        onClick={onClose}
        className='absolute inset-0 bg-black/40'
        aria-label='Close'
      />

      <div className='relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl'>
        <div className='flex items-center justify-between border-b border-slate-200 px-5 py-4'>
          <div className='min-w-0'>
            <div className='text-base font-extrabold text-slate-900'>
              Checkout
            </div>
            <div className='mt-0.5 text-sm text-slate-600'>
              Confirm your order details.
            </div>
          </div>

          <button
            onClick={onClose}
            className='inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            aria-label='Close modal'
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className='p-5 space-y-4'>
          {error ? (
            <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
              {error}
            </div>
          ) : null}

          <div className='grid gap-3 sm:grid-cols-2'>
            <div>
              <label className='text-sm font-semibold text-slate-800'>
                Full name
              </label>
              <div className='mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-red-200'>
                <User size={18} className='text-slate-500' />
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className='w-full bg-transparent text-sm outline-none'
                  placeholder='e.g. John'
                  autoComplete='name'
                />
              </div>
              {touched && !customerName.trim() ? (
                <div className='mt-1 text-xs font-semibold text-red-600'>
                  Name is required.
                </div>
              ) : null}
            </div>

            <div>
              <label className='text-sm font-semibold text-slate-800'>
                Phone
              </label>
              <div className='mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-red-200'>
                <Phone size={18} className='text-slate-500' />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className='w-full bg-transparent text-sm outline-none'
                  placeholder='e.g. +381...'
                  autoComplete='tel'
                />
              </div>
              {touched && !phone.trim() ? (
                <div className='mt-1 text-xs font-semibold text-red-600'>
                  Phone is required.
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <label className='text-sm font-semibold text-slate-800'>
              Address
            </label>
            <div className='mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-red-200'>
              <MapPin size={18} className='text-slate-500' />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className='w-full bg-transparent text-sm outline-none'
                placeholder='Street, number, city'
                autoComplete='street-address'
              />
            </div>
            {touched && !address.trim() ? (
              <div className='mt-1 text-xs font-semibold text-red-600'>
                Address is required.
              </div>
            ) : null}
          </div>

          <div>
            <label className='text-sm font-semibold text-slate-800'>
              Note (optional)
            </label>
            <div className='mt-1 flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-red-200'>
              <ClipboardList size={18} className='mt-0.5 text-slate-500' />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className='min-h-21 w-full resize-none bg-transparent text-sm outline-none'
                placeholder='Delivery notes, door code, etc.'
              />
            </div>
          </div>

          <div className='rounded-xl border border-slate-200 bg-white p-4'>
            <div className='text-sm font-extrabold text-slate-900'>
              Order summary
            </div>
            <div className='mt-2 space-y-1 text-sm text-slate-700'>
              <div className='flex items-center justify-between'>
                <span>Lines</span>
                <span className='font-semibold'>{items.length}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Total</span>
                <span className='text-base font-extrabold text-slate-900'>
                  {totalLabel}
                </span>
              </div>
            </div>
          </div>

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
              <CreditCard size={18} />
              {isLoading ? 'Placing order...' : 'Place order'}
            </button>
          </div>

          <div className='text-xs text-slate-500'>
            Payment is simulated for MVP (no external payments yet).
          </div>
        </form>
      </div>
    </div>
  );
}
