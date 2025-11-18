export interface SpendingSummary {
  totalSpending: number;
  transactionCount: number;
  categoryBreakdown: CategoryData[];
  periodStart: string;
  periodEnd: string;
}

export interface CategoryData {
  category: string;
  totalSpent: number;
  transactionCount: number;
  percentageOfTotal: number;
}

export interface TrendData {
  date: string;
  amount: number;
  transactionCount: number;
}

export interface BudgetComparison {
  budgetId: string;
  budgetName: string;
  budgetAmount: number;
  actualSpending: number;
  percentage: number;
  category?: string;
  status: 'safe' | 'warning' | 'critical';
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
}
