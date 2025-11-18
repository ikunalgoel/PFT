/**
 * Settings type definitions
 */

export type Currency = 'GBP' | 'INR';

export interface UserSettings {
  id: string;
  user_id: string;
  currency: Currency;
  created_at: string;
  updated_at: string;
}

export interface UserSettingsInput {
  currency: Currency;
}

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  locale: string;
}
