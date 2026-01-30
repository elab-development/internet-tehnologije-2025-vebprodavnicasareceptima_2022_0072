export function money(n) {
  const x = Number(n || 0);
  return `$${x.toFixed(2)}`;
}
