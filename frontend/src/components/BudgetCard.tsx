import React from 'react';
import { Budget } from '../types/budget';
import { useBudgetProgress } from '../hooks/useBudgets';
import { useCurrency } from '../contexts/CurrencyContext';

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onEdit, onDelete }) => {
  const { formatAmount } = useCurrency();
  const { data: progress, isLoading } = useBudgetProgress(budget.id);

  // Calculate percentage and determine color
  const percentage = progress?.percentage || 0;
  const currentSpending = progress?.currentSpending || 0;
  const remaining = progress?.remaining || budget.amount;

  // Color coding based on threshold
  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-red-600'; // Critical (100%+)
    if (percentage >= 80) return 'bg-yellow-500'; // Warning (80%+)
    return 'bg-green-600'; // Good (< 80%)
  };

  const getTextColor = () => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Format period display
  const formatPeriod = () => {
    if (budget.periodType === 'monthly') {
      return 'Monthly';
    }
    if (budget.periodStart && budget.periodEnd) {
      const start = new Date(budget.periodStart).toLocaleDateString();
      const end = new Date(budget.periodEnd).toLocaleDateString();
      return `${start} - ${end}`;
    }
    return 'Custom';
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{budget.name}</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {budget.category || 'All Categories'} • {formatPeriod()}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(budget)}
            className="text-blue-600 hover:text-blue-800 active:text-blue-900 text-xs sm:text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 active:bg-blue-100 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            className="text-red-600 hover:text-red-800 active:text-red-900 text-xs sm:text-sm font-medium px-2 py-1 rounded hover:bg-red-50 active:bg-red-100 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Spending vs Limit */}
      <div className="mb-3">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-xl sm:text-2xl font-bold text-gray-900">
            {formatAmount(currentSpending)}
          </span>
          <span className="text-xs sm:text-sm text-gray-500">
            of {formatAmount(budget.amount)}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3 overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-300`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Percentage and Remaining */}
      <div className="flex justify-between items-center">
        <span className={`text-xs sm:text-sm font-semibold ${getTextColor()}`}>
          {isLoading ? 'Loading...' : `${percentage.toFixed(1)}% used`}
        </span>
        <span className="text-xs sm:text-sm text-gray-600">
          {formatAmount(remaining)} remaining
        </span>
      </div>

      {/* Active Alerts */}
      {progress?.alerts && progress.alerts.length > 0 && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
          {progress.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`text-xs font-medium ${
                alert.alertType === 'critical' ? 'text-red-600' : 'text-yellow-600'
              }`}
            >
              {alert.alertType === 'critical' ? '⚠️ Budget exceeded!' : '⚠️ Approaching limit'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
