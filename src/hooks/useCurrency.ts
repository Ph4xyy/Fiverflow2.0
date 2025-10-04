import { useCurrency as useCurrencyContext } from '../contexts/CurrencyContext';

/**
 * Hook to get user's default currency for formatting
 * @returns The user's preferred currency (default: 'USD')
 */
export const useCurrency = (): string => {
  const { currency } = useCurrencyContext();
  return currency;
};
