import React from 'react';
import { useCurrency } from '../contexts/CurrencyContext';

interface SummaryCardProps {
  title: string;
  value: string | number;
  isLoading?: boolean;
  error?: boolean;
  icon?: React.ReactNode;
  subtitle?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  isLoading,
  error,
  icon,
  subtitle,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      
      {isLoading ? (
        <div className="mt-2">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      ) : error ? (
        <p className="text-2xl font-bold text-red-600 mt-2">Error</p>
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </>
      )}
    </div>
  );
};

interface SummaryCardsProps {
  totalSpending: number;
  activeBudgets: number;
  alertCount: number;
  isLoading?: boolean;
  error?: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalSpending,
  activeBudgets,
  alertCount,
  isLoading,
  error,
}) => {
  const { formatAmount: formatCurrency } = useCurrency();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SummaryCard
        title="Total Spending"
        value={formatCurrency(totalSpending)}
        isLoading={isLoading}
        error={error}
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />
      
      <SummaryCard
        title="Active Budgets"
        value={activeBudgets}
        isLoading={isLoading}
        error={error}
        icon={
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        }
      />
      
      <SummaryCard
        title="Alerts"
        value={alertCount}
        isLoading={isLoading}
        error={error}
        subtitle={alertCount > 0 ? 'Budget thresholds exceeded' : 'All budgets on track'}
        icon={
          <svg
            className={`w-6 h-6 ${alertCount > 0 ? 'text-red-500' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        }
      />
    </div>
  );
};
