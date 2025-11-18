export interface Budget {
  id: string;
  userId: string;
  name: string;
  amount: number;
  periodType: 'monthly' | 'custom';
  periodStart?: string;
  periodEnd?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetInput {
  name: string;
  amount: number;
  periodType: 'monthly' | 'custom';
  periodStart?: string;
  periodEnd?: string;
  category?: string;
}

export interface BudgetProgress {
  budgetId: string;
  budget: Budget;
  currentSpending: number;
  percentage: number;
  remaining: number;
  alerts: Alert[];
}

export interface Alert {
  id: string;
  budgetId: string;
  alertType: 'warning' | 'critical';
  thresholdPercentage: number;
  triggeredAt: string;
  resolvedAt?: string;
  isActive: boolean;
}
