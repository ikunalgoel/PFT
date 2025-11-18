import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAnalyticsTrends } from '../hooks/useAnalytics';
import { useApp } from '../contexts/AppContext';
import { useCurrency } from '../contexts/CurrencyContext';

type ChartType = 'line' | 'bar';
type ViewMode = 'daily' | 'weekly' | 'monthly';

export const TrendLineChart: React.FC = () => {
  const { formatAmount: formatCurrency } = useCurrency();
  const { dateRange, selectedCategories } = useApp();
  const [chartType, setChartType] = useState<ChartType>('line');
  const [viewMode, setViewMode] = useState<ViewMode>('daily');

  // Prepare filters
  const filters = useMemo(() => ({
    startDate: dateRange.start.toISOString().split('T')[0],
    endDate: dateRange.end.toISOString().split('T')[0],
    category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
  }), [dateRange, selectedCategories]);

  const { data: trends, isLoading, error } = useAnalyticsTrends(filters);

  // Aggregate data based on view mode
  const chartData = useMemo(() => {
    if (!trends) return [];

    if (viewMode === 'daily') {
      return trends.map(t => ({
        date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: t.amount,
        count: t.transactionCount,
      }));
    }

    // For weekly/monthly aggregation
    const aggregated = new Map<string, { amount: number; count: number }>();

    trends.forEach(t => {
      const date = new Date(t.date);
      let key: string;

      if (viewMode === 'weekly') {
        // Get week number
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        // Monthly
        key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      }

      const existing = aggregated.get(key) || { amount: 0, count: 0 };
      aggregated.set(key, {
        amount: existing.amount + t.amount,
        count: existing.count + t.transactionCount,
      });
    });

    return Array.from(aggregated.entries()).map(([date, data]) => ({
      date,
      amount: data.amount,
      count: data.count,
    }));
  }, [trends, viewMode]);



  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-gray-900">{data.date}</p>
          <p className="text-sm text-gray-600">
            Amount: {formatCurrency(data.amount)}
          </p>
          <p className="text-sm text-gray-600">
            Transactions: {data.count}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Spending Trends
        </h2>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Spending Trends
        </h2>
        <div className="h-80 flex items-center justify-center">
          <p className="text-red-600">Failed to load trend data</p>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Spending Trends
        </h2>
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500">No trend data available for the selected period</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Spending Trends
        </h2>
        
        <div className="flex flex-wrap gap-2">
          {/* View Mode Selector */}
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm ${
                viewMode === 'daily'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100'
              } transition-colors`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm border-l border-gray-300 ${
                viewMode === 'weekly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100'
              } transition-colors`}
            >
              Weekly
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm border-l border-gray-300 ${
                viewMode === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100'
              } transition-colors`}
            >
              Monthly
            </button>
          </div>

          {/* Chart Type Selector */}
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setChartType('line')}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm ${
                chartType === 'line'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100'
              } transition-colors`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm border-l border-gray-300 ${
                chartType === 'bar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100'
              } transition-colors`}
            >
              Bar
            </button>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        {chartType === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
              width={window.innerWidth < 640 ? 50 : 60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: window.innerWidth < 640 ? '12px' : '14px' }} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: window.innerWidth < 640 ? 3 : 4 }}
              activeDot={{ r: window.innerWidth < 640 ? 5 : 6 }}
              name="Spending"
            />
          </LineChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
              width={window.innerWidth < 640 ? 50 : 60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: window.innerWidth < 640 ? '12px' : '14px' }} />
            <Bar
              dataKey="amount"
              fill="#3B82F6"
              name="Spending"
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
