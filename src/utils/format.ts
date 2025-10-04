// src/utils/format.ts
export const formatMoney = (amount?: number | null, currency: string = 'USD') => {
  if (amount == null || isNaN(amount)) return '—';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
};

/**
 * Format money using user's default currency preference
 * This function should be used inside React components where useCurrency is available
 */
export const formatMoneyDefault = (amount?: number | null, userCurrency?: string) => {
  const currency = userCurrency || 'USD';
  return formatMoney(amount, currency);
};

export const formatDate = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString();
};
