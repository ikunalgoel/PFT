import React from 'react';
import { CategoryInsight } from '../types/insights';

interface CategoryInsightsProps {
  insights: CategoryInsight[];
}

export const CategoryInsights: React.FC<CategoryInsightsProps> = ({ insights }) => {
  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 pb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg
          className="h-5 w-5 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        Category Analysis
      </h3>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-900">{insight.category}</h4>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  ${insight.totalSpent.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  {insight.percentageOfTotal.toFixed(1)}% of total
                </p>
              </div>
            </div>
            <p className="text-gray-700 text-sm">{insight.insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
