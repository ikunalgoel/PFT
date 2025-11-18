import React from 'react';
import { Projection } from '../types/insights';
import { useCurrency } from '../contexts/CurrencyContext';

interface ProjectionsProps {
  projections: Projection | null | undefined;
}

export const Projections: React.FC<ProjectionsProps> = ({ projections }) => {
  const { formatAmount } = useCurrency();

  // Add comprehensive null checks and default values
  if (!projections) {
    return null;
  }

  // Ensure all required properties exist with default values
  const nextWeek = projections.nextWeek ?? 0;
  const nextMonth = projections.nextMonth ?? 0;
  const confidence = projections.confidence ?? 'medium';
  const explanation = projections.explanation ?? 'No explanation available';

  // Don't render if both projections are zero
  if (nextWeek === 0 && nextMonth === 0) {
    return null;
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg
          className="h-5 w-5 text-indigo-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
        Spending Projections
      </h3>
      <div className="bg-indigo-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Next Week</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatAmount(nextWeek)}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Next Month</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatAmount(nextMonth)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-600">Confidence Level:</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${getConfidenceColor(confidence)}`}
          >
            {confidence.toUpperCase()}
          </span>
        </div>
        <p className="text-gray-700 text-sm">{explanation}</p>
      </div>
    </div>
  );
};
