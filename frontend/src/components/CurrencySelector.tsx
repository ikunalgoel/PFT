import React from 'react';
import { Currency } from '../types/settings';

interface CurrencySelectorProps {
  value: Currency;
  onChange: (currency: Currency) => void;
  disabled?: boolean;
  error?: string;
}

const CURRENCIES = [
  { code: 'GBP' as Currency, symbol: '£', name: 'British Pound (GBP)' },
  { code: 'INR' as Currency, symbol: '₹', name: 'Indian Rupee (INR)' },
];

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value,
  onChange,
  disabled = false,
  error,
}) => {
  return (
    <div>
      <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
        Currency
      </label>
      <select
        id="currency"
        value={value}
        onChange={(e) => onChange(e.target.value as Currency)}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        {CURRENCIES.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.symbol} {currency.name}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
