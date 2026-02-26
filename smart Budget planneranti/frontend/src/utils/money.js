export function formatMoney(n) {
  const num = Number(n || 0);
  return `$${num.toFixed(2)}`;
}