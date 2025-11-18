import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useBudgets } from '../hooks/useBudgets';
import { useTransactions } from '../hooks/useTransactions';
import { Budget } from '../types/budget';
import { useCurrency } from '../contexts/CurrencyContext';

interface BudgetProgressData {
  name: string;
  budgetAmount: number;
  actualSpending: number;
  percentage: number;
  status: 'safe' | 'warning' | 'critical';
}

export const BudgetProgressChart: React.FC = () => {
  const { formatAmount: formatCurrency } = useCurrency();
  const { data: budgets, isLoading: budgetsLoading, error: budgetsError } = useBudgets();
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();

  // Calculate spending for each budget
  const chartData = useMemo<BudgetProgressData[]>(() => {
    if (!budgets || !transactions) return [];

    return budgets.map((budget: Budget) => {
      // Calculate date range for the budget
      let startDate: Date;
      let endDate: Date;

      if (budget.periodType === 'monthly') {
        // Current month
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else {
        // Custom period
        startDate = budget.periodStart ? new Date(budget.periodStart) : new Date(0);
        endDate = budget.periodEnd ? new Date(budget.periodEnd) : new Date();
      }

      // Filter transactions for this budget
      const budgetTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const isInDateRange = transactionDate >= startDate && transactionDate <= endDate;
        const isInCategory = !budget.category || t.category === budget.category;
        return isInDateRange && isInCategory;
      });

      // Calculate total spending
      const actualSpending = budgetTransactions.reduce((sum, t) => sum + t.amount, 0);
      const percentage = (actualSpending / budget.amount) * 100;

      // Determine status
      let status: 'safe' | 'warning' | 'critical';
      if (percentage >= 100) {
        status = 'critical';
      } else if (percentage >= 80) {
        status = 'warning';
      } else {
        status = 'safe';
      }

      return {
        name: budget.name,
        budgetAmount: budget.amount,
        actualSpending,
        percentage,
        status,
      };
    });
  }, [budgets, transactions]);



  const getBarColor = (status: string) => {
    switch (status) {
      case 'critical':
        return '#EF4444'; // red
      case 'warning':
        return '#F59E0B'; // amber
      default:
        return '#10B981'; // green
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Budget: {formatCurrency(data.budgetAmount)}
          </p>
          <p className="text-sm text-gray-600">
            Spent: {formatCurrency(data.actualSpending)}
          </p>
          <p className="text-sm text-gray-600">
            Progress: {data.percentage.toFixed(1)}%
          </p>
          <p className={`text-sm font-semibold ${
            data.status === 'critical' ? 'text-red-600' :
            data.status === 'warning' ? 'text-amber-600' :
            'text-green-600'
          }`}>
            {data.status === 'critical' ? 'Over Budget' :
             data.status === 'warning' ? 'Approaching Limit' :
             'On Track'}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = (props: any) => {
    const { x, y, width, payload } = props;
    
    // Guard against undefined payload or missing percentage
    if (!payload || typeof payload.percentage !== 'number') {
      return null;
    }
    
    return (
      <text
        x={x + width + 5}
        y={y + 15}
        fill="#374151"
        fontSize={12}
        textAnchor="start"
      >
        {payload.percentage.toFixed(0)}%
      </text>
    );
  };

  if (budgetsLoading || transactionsLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Budget Progress
        </h2>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (budgetsError) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Budget Progress
        </h2>
        <div className="h-80 flex items-center justify-center">
          <p className="text-red-600">Failed to load budget data</p>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Budget Progress
        </h2>
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500">No budgets created yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
        Budget Progress
      </h2>

      <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600">On Track (&lt;80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-amber-500 rounded"></div>
          <span className="text-gray-600">Warning (80-100%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded"></div>
          <span className="text-gray-600">Over Budget (&gt;100%)</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 60)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ 
            top: 5, 
            right: window.innerWidth < 640 ? 40 : 60, 
            left: 5, 
            bottom: 5 
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            tickFormatter={formatCurrency}
            tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={window.innerWidth < 640 ? 100 : 150}
            tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: window.innerWidth < 640 ? '12px' : '14px' }} />
          <Bar
            dataKey="budgetAmount"
            fill="#E5E7EB"
            name="Budget Limit"
            radius={[0, 4, 4, 0]}
          />
          <Bar
            dataKey="actualSpending"
            name="Actual Spending"
            radius={[0, 4, 4, 0]}
            label={<CustomLabel />}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
