import { useMemo } from 'react';
import { useCurrencyStore } from '../stores/currencyStore';

function formatMoney(amountUsd, currency, rates) {
  const usd = Number(amountUsd ?? 0);
  const rate = Number(rates?.[currency] ?? 1);
  const value = usd * rate;

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    const symbol =
      currency === 'EUR' ? '€' : currency === 'USD' ? '$' : `${currency} `;
    return `${symbol}${value.toFixed(2)}`;
  }
}

export function useMoney(amountUsd) {
  const currency = useCurrencyStore((s) => s.currency);
  const rate = useCurrencyStore((s) => s.rates?.[s.currency] ?? 1);

  return useMemo(() => {
    const rates = { [currency]: rate };
    return formatMoney(amountUsd, currency, rates);
  }, [amountUsd, currency, rate]);
}

export function badge(status) {
  const s = String(status || '').toUpperCase();
  const base =
    'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold';

  if (s === 'PENDING') return `${base} bg-yellow-100 text-yellow-800`;
  if (s === 'PROCESSING') return `${base} bg-blue-100 text-blue-800`;
  if (s === 'PAID') return `${base} bg-green-100 text-green-800`;
  if (s === 'COMPLETED') return `${base} bg-green-100 text-green-800`;
  if (s === 'CANCELLED') return `${base} bg-red-100 text-red-700`;
  return `${base} bg-slate-100 text-slate-700`;
}
