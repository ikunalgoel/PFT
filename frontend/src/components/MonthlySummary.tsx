import React from 'react';

interface MonthlySummaryProps {
  summary: string;
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({ summary }) => {
  return (
    <div className="border-b border-gray-200 pb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <svg
          className="h-5 w-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Monthly Summary
      </h3>
      <p className="text-gray-700 leading-relaxed">{summary}</p>
    </div>
  );
};
