export interface AIInsights {
  id: string;
  userId: string;
  periodStart: string;
  periodEnd: string;
  monthlySummary: string;
  categoryInsights: CategoryInsight[];
  spendingSpikes: SpendingSpike[];
  recommendations: string[];
  projections: Projection | null;
  generatedAt: string;
}

export interface CategoryInsight {
  category: string;
  totalSpent: number;
  percentageOfTotal: number;
  insight: string;
}

export interface SpendingSpike {
  date: string;
  amount: number;
  category: string;
  description: string;
}

export interface Projection {
  nextWeek: number;
  nextMonth: number;
  confidence: 'high' | 'medium' | 'low';
  explanation: string;
}

export interface GenerateInsightsRequest {
  startDate: string;
  endDate: string;
}

export interface ExportInsightsRequest {
  insightId: string;
  format: 'pdf' | 'text';
}
