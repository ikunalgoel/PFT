import React, { useState } from 'react';
import { Alert } from '../types/budget';
import { useBudgets } from '../hooks/useBudgets';
import { useBudgetProgress } from '../hooks/useBudgets';

interface AlertWithBudget extends Alert {
  budgetName: string;
  budgetAmount: number;
  currentSpending: number;
}

export const AlertBanner: React.FC = () => {
  const { data: budgets } = useBudgets();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Collect all active alerts from all budgets
  const alerts: AlertWithBudget[] = [];

  // We need to fetch progress for each budget to get alerts
  // For simplicity, we'll use a custom hook approach
  const BudgetAlertCollector: React.FC<{ budgetId: string; budgetName: string; budgetAmount: number }> = ({ 
    budgetId, 
    budgetName, 
    budgetAmount 
  }) => {
    const { data: progress } = useBudgetProgress(budgetId);
    
    if (progress?.alerts) {
      progress.alerts.forEach((alert) => {
        if (alert.isActive && !dismissedAlerts.has(alert.id)) {
          alerts.push({
            ...alert,
            budgetName,
            budgetAmount,
            currentSpending: progress.currentSpending,
          });
        }
      });
    }
    
    return null;
  };

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]));
  };

  if (!budgets || budgets.length === 0) {
    return null;
  }

  return (
    <>
      {/* Render hidden components to collect alerts */}
      {budgets.map((budget) => (
        <BudgetAlertCollector
          key={budget.id}
          budgetId={budget.id}
          budgetName={budget.name}
          budgetAmount={budget.amount}
        />
      ))}

      {/* Display alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const isCritical = alert.alertType === 'critical';
            const bgColor = isCritical ? 'bg-red-50' : 'bg-yellow-50';
            const borderColor = isCritical ? 'border-red-200' : 'border-yellow-200';
            const textColor = isCritical ? 'text-red-800' : 'text-yellow-800';
            const iconColor = isCritical ? 'text-red-600' : 'text-yellow-600';

            return (
              <div
                key={alert.id}
                className={`${bgColor} border ${borderColor} rounded-lg p-4 flex items-start gap-3`}
              >
                {/* Alert Icon */}
                <div className={`flex-shrink-0 ${iconColor}`}>
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                {/* Alert Content */}
                <div className="flex-1">
                  <h3 className={`text-sm font-semibold ${textColor}`}>
                    {isCritical ? 'Budget Exceeded' : 'Budget Warning'}
                  </h3>
                  <p className={`text-sm ${textColor} mt-1`}>
                    <span className="font-medium">{alert.budgetName}</span>
                    {': '}
                    You've spent ${alert.currentSpending.toFixed(2)} of your $
                    {alert.budgetAmount.toFixed(2)} budget
                    {isCritical
                      ? ' (exceeded limit)'
                      : ` (${alert.thresholdPercentage}% threshold reached)`}
                  </p>
                </div>

                {/* Dismiss Button */}
                <button
                  onClick={() => handleDismiss(alert.id)}
                  className={`flex-shrink-0 ${textColor} hover:opacity-70 transition-opacity`}
                  aria-label="Dismiss alert"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
