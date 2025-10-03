export function formatNumber(value: number | string, decimals: number = 2): string {
  if (value === null || value === undefined) return '';
  const num = typeof value === 'string' ? Number(value) : value;
  if (!isFinite(num)) return String(value);
  const fixed = num.toFixed(decimals);
  return fixed.replace(/\.0+$/, '').replace(/(\.\d*?[1-9])0+$/, '$1');
}


