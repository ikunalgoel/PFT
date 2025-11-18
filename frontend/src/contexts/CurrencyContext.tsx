import React, { createContext, useContext, ReactNode } from 'react';
import { Currency, CurrencyConfig } from '../types/settings';
import { useSettings } from '../hooks/useSettings';

interface CurrencyContextType {
  currency: Currency;
  currencySymbol: string;
  currencyName: string;
  formatAmount: (amount: number) => string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_CONFIGS: Record<Currency, CurrencyConfig> = {
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    locale: 'en-IN',
  },
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const { data: settings, isLoading } = useSettings();

  const currency = settings?.currency || 'GBP';
  const config = CURRENCY_CONFIGS[currency];

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const value: CurrencyContextType = {
    currency,
    currencySymbol: config.symbol,
    currencyName: config.name,
    formatAmount,
    isLoading,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
