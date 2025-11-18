import { Currency } from '../types/database.js';

/**
 * Currency configuration interface
 */
export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  locale: string;
}

/**
 * Supported currencies configuration
 */
export const SUPPORTED_CURRENCIES: Record<Currency, CurrencyConfig> = {
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

/**
 * Currency Formatter Utility Class
 * Provides methods for formatting currency values
 */
export class CurrencyFormatter {
  /**
   * Format an amount with the specified currency
   * @param amount - The numeric amount to format
   * @param currency - The currency code (GBP or INR)
   * @returns Formatted currency string (e.g., "£1,234.56" or "₹1,234.56")
   */
  static format(amount: number, currency: Currency): string {
    const config = SUPPORTED_CURRENCIES[currency];
    
    if (!config) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Get the currency symbol for a given currency code
   * @param currency - The currency code (GBP or INR)
   * @returns Currency symbol (£ or ₹)
   */
  static getSymbol(currency: Currency): string {
    const config = SUPPORTED_CURRENCIES[currency];
    
    if (!config) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    return config.symbol;
  }

  /**
   * Get the currency name for a given currency code
   * @param currency - The currency code (GBP or INR)
   * @returns Currency name (e.g., "British Pound")
   */
  static getName(currency: Currency): string {
    const config = SUPPORTED_CURRENCIES[currency];
    
    if (!config) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    return config.name;
  }

  /**
   * Get the locale for a given currency code
   * @param currency - The currency code (GBP or INR)
   * @returns Locale string (e.g., "en-GB")
   */
  static getLocale(currency: Currency): string {
    const config = SUPPORTED_CURRENCIES[currency];
    
    if (!config) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    return config.locale;
  }

  /**
   * Get all supported currency codes
   * @returns Array of supported currency codes
   */
  static getSupportedCurrencies(): Currency[] {
    return Object.keys(SUPPORTED_CURRENCIES) as Currency[];
  }

  /**
   * Check if a currency code is supported
   * @param currency - The currency code to check
   * @returns True if the currency is supported, false otherwise
   */
  static isSupported(currency: string): currency is Currency {
    return currency in SUPPORTED_CURRENCIES;
  }

  /**
   * Validate a currency code
   * @param currency - The currency code to validate
   * @throws Error if the currency is not supported
   */
  static validate(currency: string): asserts currency is Currency {
    if (!this.isSupported(currency)) {
      throw new Error(
        `Invalid currency: ${currency}. Supported currencies: ${this.getSupportedCurrencies().join(', ')}`
      );
    }
  }

  /**
   * Get currency configuration
   * @param currency - The currency code
   * @returns Currency configuration object
   */
  static getConfig(currency: Currency): CurrencyConfig {
    const config = SUPPORTED_CURRENCIES[currency];
    
    if (!config) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    return config;
  }
}

/**
 * Helper function to format currency (shorthand)
 */
export function formatCurrency(amount: number, currency: Currency): string {
  return CurrencyFormatter.format(amount, currency);
}

/**
 * Helper function to get currency symbol (shorthand)
 */
export function getCurrencySymbol(currency: Currency): string {
  return CurrencyFormatter.getSymbol(currency);
}

/**
 * Helper function to validate currency
 */
export function validateCurrency(currency: string): currency is Currency {
  return CurrencyFormatter.isSupported(currency);
}
