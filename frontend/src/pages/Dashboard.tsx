import React, { useMemo, lazy, Suspense } from 'react';
import { SummaryCards } from '../components/SummaryCards';
import { AlertBanner } from '../components/AlertBanner';
import { FilterBar } from '../components/FilterBar';
import { DashboardSkeleton } from '../components/Skeleton';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAnalyticsSummary } from '../hooks/useAnalytics';
import { useBudgets } from '../hooks/useBudgets';
import { useApp } from '../contexts/AppContext';

// Lazy load heavy chart components for better performance
const CategoryPieChart = lazy(() => import('../components/CategoryPieChart').then(m => ({ default: m.CategoryPieChart })));
const TrendLineChart = lazy(() => import('../components/TrendLineChart').then(m => ({ default: m.TrendLineChart })));
const BudgetProgressChart = lazy(() => import('../components/BudgetProgressChart').then(m => ({ default: m.BudgetProgressChart })));
const InsightsPanel = lazy(() => import('../components/InsightsPanel').then(m => ({ default: m.InsightsPanel })));

export const Dashboard: React.FC = () => {
  const { dateRange, selectedCategories } = useApp();

  // Prepare filters
  const filters = useMemo(() => ({
    startDate: dateRange.start.toISOString().split('T')[0],
    endDate: dateRange.end.toISOString().split('T')[0],
    category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
  }), [dateRange, selectedCategories]);

  // Fetch data
  const { 
    data: summary, 
    isLoading: summaryLoading, 
    error: summaryError,
    refetch: refetchSummary 
  } = useAnalyticsSummary(filters);
  
  const { 
    data: budgets, 
    isLoading: budgetsLoading, 
    error: budgetsError,
    refetch: refetchBudgets 
  } = useBudgets();

  // Calculate active alerts
  const alertCount = useMemo(() => {
    if (!budgets) return 0;
    // This will be properly calculated when we fetch budget progress
    // For now, we'll use a placeholder
    return 0;
  }, [budgets]);

  const isLoading = summaryLoading || budgetsLoading;
  const hasError = !!summaryError || !!budgetsError;

  // Show loading skeleton on initial load
  if (isLoading && !summary && !budgets) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  // Show error message if initial load failed
  if (hasError && !summary && !budgets) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <ErrorMessage
          message="Failed to load dashboard data. Please try again."
          onRetry={() => {
            refetchSummary();
            refetchBudgets();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Alert Banner */}
      <AlertBanner />

      {/* Filter Bar */}
      <FilterBar />

      {/* Summary Cards */}
      <SummaryCards
        totalSpending={summary?.totalSpending || 0}
        activeBudgets={budgets?.length || 0}
        alertCount={alertCount}
        isLoading={isLoading}
        error={hasError}
      />

      {/* Charts Grid */}
      <Suspense fallback={
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-lg shadow flex items-center justify-center h-80">
            <LoadingSpinner />
          </div>
          <div className="bg-white p-6 rounded-lg shadow flex items-center justify-center h-80">
            <LoadingSpinner />
          </div>
        </div>
      }>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <CategoryPieChart />
          <BudgetProgressChart />
        </div>
      </Suspense>

      {/* Trend Chart - Full Width */}
      <Suspense fallback={
        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-center h-80">
          <LoadingSpinner />
        </div>
      }>
        <TrendLineChart />
      </Suspense>

      {/* AI Insights Panel */}
      <Suspense fallback={
        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-center min-h-[300px]">
          <LoadingSpinner />
        </div>
      }>
        <InsightsPanel />
      </Suspense>
    </div>
  );
};
