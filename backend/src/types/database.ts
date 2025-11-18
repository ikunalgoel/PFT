/**
 * Database type definitions
 * These interfaces match the Supabase database schema
 */

// Transaction types
export interface Transaction {
  id: string;
  user_id: string;
  date: string; // ISO date string
  amount: number;
  category: string;
  merchant?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionInput {
  date: string;
  amount: number;
  category: string;
  merchant?: string;
  notes?: string;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  merchant?: string;
}

// Budget types
export type BudgetPeriodType = 'monthly' | 'custom';

export interface Budget {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  period_type: BudgetPeriodType;
  period_start?: string;
  period_end?: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetInput {
  name: string;
  amount: number;
  period_type: BudgetPeriodType;
  period_start?: string;
  period_end?: string;
  category?: string;
}

export interface BudgetProgress {
  budget_id: string;
  budget: Budget;
  current_spending: number;
  percentage: number;
  remaining: number;
  alerts: Alert[];
}

// Alert types
export type AlertType = 'warning' | 'critical';

export interface Alert {
  id: string;
  budget_id: string;
  alert_type: AlertType;
  threshold_percentage: number;
  triggered_at: string;
  resolved_at?: string;
  is_active: boolean;
}

export interface AlertInput {
  budget_id: string;
  alert_type: AlertType;
  threshold_percentage: number;
}

// AI Insights types
export interface CategoryInsight {
  category: string;
  total_spent: number;
  percentage_of_total: number;
  insight: string;
}

export interface SpendingSpike {
  date: string;
  amount: number;
  category: string;
  description: string;
}

export interface Projection {
  next_week: number;
  next_month: number;
  confidence: 'high' | 'medium' | 'low';
  explanation: string;
}

export interface AIInsights {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  monthly_summary: string;
  category_insights: CategoryInsight[];
  spending_spikes: SpendingSpike[];
  recommendations: string[];
  projections: Projection;
  generated_at: string;
}

export interface AIInsightsInput {
  period_start: string;
  period_end: string;
  monthly_summary: string;
  category_insights: CategoryInsight[];
  spending_spikes?: SpendingSpike[];
  recommendations?: string[];
  projections?: Projection;
}

// Analytics types
export interface SpendingSummary {
  total_spending: number;
  transaction_count: number;
  average_transaction: number;
  category_breakdown: CategoryBreakdown[];
  period: {
    start: string;
    end: string;
  };
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface TrendData {
  date: string;
  amount: number;
  transaction_count: number;
}

export interface BudgetComparison {
  budget: Budget;
  actual_spending: number;
  percentage_used: number;
  status: 'under' | 'near' | 'over';
}

// User Settings types
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

// Database table names
export const TABLE_NAMES = {
  TRANSACTIONS: 'transactions',
  BUDGETS: 'budgets',
  BUDGET_ALERTS: 'budget_alerts',
  AI_INSIGHTS: 'ai_insights',
  USER_SETTINGS: 'user_settings',
} as const;

// Error types
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  CSV_PARSE_ERROR = 'CSV_PARSE_ERROR',
}

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: any;
  timestamp: string;
}
