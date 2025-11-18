import React from 'react';

interface RecommendationsProps {
  recommendations: string[];
}

export const Recommendations: React.FC<RecommendationsProps> = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 pb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg
          className="h-5 w-5 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        Savings Recommendations
      </h3>
      <div className="space-y-3">
        {recommendations.map((recommendation, index) => (
          <div
            key={index}
            className="flex items-start gap-3 bg-purple-50 rounded-lg p-4 hover:bg-purple-100 transition-colors"
          >
            <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              {index + 1}
            </div>
            <p className="text-gray-700 flex-1">{recommendation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
