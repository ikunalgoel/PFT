import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAnalyticsCategories } from '../hooks/useAnalytics';
import { useApp } from '../contexts/AppContext';
import { useCurrency } from '../contexts/CurrencyContext';

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
  '#6366F1', // indigo
  '#84CC16', // lime
];

export const CategoryPieChart: React.FC = () => {
  const { formatAmount: formatCurrency } = useCurrency();
  const { dateRange, selectedCategories } = useApp();

  // Prepare filters
  const filters = useMemo(() => ({
    startDate: dateRange.start.toISOString().split('T')[0],
    endDate: dateRange.end.toISOString().split('T')[0],
  }), [dateRange]);

  const { data: categories, isLoading, error } = useAnalyticsCategories(filters);

  // Filter and format data for the chart
  const chartData = useMemo(() => {
    if (!categories) return [];
    
    let filteredData = categories;
    
    // Apply category filter if selected
    if (selectedCategories.length > 0) {
      filteredData = categories.filter(cat => 
        selectedCategories.includes(cat.category)
      );
    }
    
    return filteredData.map(cat => ({
      name: cat.category,
      value: cat.totalSpent,
      percentage: cat.percentageOfTotal,
      count: cat.transactionCount,
    }));
  }, [categories, selectedCategories]);



  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Amount: {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-gray-600">
            Percentage: {data.percentage.toFixed(1)}%
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
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Spending by Category
        </h2>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Spending by Category
        </h2>
        <div className="h-80 flex items-center justify-center">
          <p className="text-sm sm:text-base text-red-600">Failed to load category data</p>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Spending by Category
        </h2>
        <div className="h-80 flex items-center justify-center">
          <p className="text-sm sm:text-base text-gray-500 text-center px-4">No spending data available for the selected period</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
        Spending by Category
      </h2>
      
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => {
              // Hide labels on very small screens
              if (window.innerWidth < 640) {
                return percentage > 10 ? `${percentage.toFixed(0)}%` : '';
              }
              return `${name} (${percentage.toFixed(1)}%)`;
            }}
            outerRadius={window.innerWidth < 640 ? 80 : 120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => value}
            wrapperStyle={{ fontSize: window.innerWidth < 640 ? '12px' : '14px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
