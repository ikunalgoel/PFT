import { useQuery } from '@tanstack/react-query';
import axios from '../lib/axios';
import {
  SpendingSummary,
  TrendData,
  CategoryData,
  AnalyticsFilters,
} from '../types/analytics';
import { useToast } from '../contexts/ToastContext';
import { getErrorMessage } from '../lib/axios';

// Fetch spending summary
export const useAnalyticsSummary = (filters?: AnalyticsFilters) => {
  const { showError } = useToast();

  return useQuery<SpendingSummary>({
    queryKey: ['analytics', 'summary', filters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.category) params.append('category', filters.category);

        const response = await axios.get(`/api/analytics/summary?${params.toString()}`);
        const data = response.data;
        
        // Transform snake_case to camelCase
        return {
          totalSpending: data.total_spending || 0,
          transactionCount: data.transaction_count || 0,
          categoryBreakdown: (data.category_breakdown || []).map((cat: any) => ({
            category: cat.category,
            totalSpent: cat.total,
            transactionCount: cat.count,
            percentageOfTotal: cat.percentage,
          })),
          periodStart: data.period?.start || '',
          periodEnd: data.period?.end || '',
        };
      } catch (error) {
        showError(getErrorMessage(error));
        throw error;
      }
    },
  });
};

// Fetch spending trends
export const useAnalyticsTrends = (filters?: AnalyticsFilters) => {
  const { showError } = useToast();

  return useQuery<TrendData[]>({
    queryKey: ['analytics', 'trends', filters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.category) params.append('category', filters.category);

        const response = await axios.get(`/api/analytics/trends?${params.toString()}`);
        const data = response.data;
        
        // Handle wrapped response
        const trends = data.trends || data;
        
        // Transform snake_case to camelCase
        return trends.map((trend: any) => ({
          date: trend.date,
          amount: trend.amount,
          transactionCount: trend.transaction_count,
        }));
      } catch (error) {
        showError(getErrorMessage(error));
        throw error;
      }
    },
  });
};

// Fetch category breakdown
export const useAnalyticsCategories = (filters?: AnalyticsFilters) => {
  const { showError } = useToast();

  return useQuery<CategoryData[]>({
    queryKey: ['analytics', 'categories', filters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const response = await axios.get(`/api/analytics/categories?${params.toString()}`);
        const data = response.data;
        
        // Handle wrapped response
        const categories = data.categories || data;
        
        // Transform snake_case to camelCase
        return categories.map((cat: any) => ({
          category: cat.category,
          totalSpent: cat.total,
          transactionCount: cat.count,
          percentageOfTotal: cat.percentage,
        }));
      } catch (error) {
        showError(getErrorMessage(error));
        throw error;
      }
    },
  });
};
