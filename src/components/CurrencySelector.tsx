// src/components/CurrencySelector.tsx
import React from 'react';
import { SUPPORTED_CURRENCIES, formatCurrencyOption } from '../utils/currencies';

interface CurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
  className?: string;
  showFlags?: boolean;
  popularOnly?: boolean;
  placeholder?: string;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value,
  onChange,
  className = '',
  showFlags = false,
  popularOnly = false,
  placeholder = 'Select currency'
}) => {
  const currencies = popularOnly 
    ? SUPPORTED_CURRENCIES.filter(c => ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'].includes(c.code))
    : SUPPORTED_CURRENCIES;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {currencies.map((currency) => (
        <option key={currency.code} value={currency.code}>
          {showFlags && currency.flag ? `${currency.flag} ` : ''}
          {formatCurrencyOption(currency.code)}
        </option>
      ))}
    </select>
  );
};

export default CurrencySelector;
