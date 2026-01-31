export function money(n) {
  const x = Number(n || 0);
  return `$${x.toFixed(2)}`;
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
