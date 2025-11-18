import React, { useState } from 'react';
import { useLatestInsights, useGenerateInsights } from '../hooks/useInsights';
import { useApp } from '../contexts/AppContext';
import { MonthlySummary } from './MonthlySummary';
import { CategoryInsights } from './CategoryInsights';
import { SpendingAlerts } from './SpendingAlerts';
import { Recommendations } from './Recommendations';
import { Projections } from './Projections';
import { ExportButton } from './ExportButton';

export const InsightsPanel: React.FC = () => {
  const { dateRange } = useApp();
  const { data: insights, isLoading, error, refetch } = useLatestInsights();
  const generateMutation = useGenerateInsights();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    try {
      await generateMutation.mutateAsync({
        startDate: dateRange.start.toISOString().split('T')[0],
        endDate: dateRange.end.toISOString().split('T')[0],
      });
      await refetch();
    } catch (err) {
      // Error is handled by the mutation
    } finally {
      setIsGenerating(false);
    }
  };

  const showLoading = isLoading || isGenerating;
  const showError = error && !isLoading;
  const showNoData = !insights && !isLoading && !error;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">AI Insights</h2>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {insights && <ExportButton insightId={insights.id} />}
          <button
            onClick={handleGenerateInsights}
            disabled={showLoading}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {showLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5"
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
                <span className="hidden sm:inline">Generate Insights</span>
                <span className="sm:hidden">Generate</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {showLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <svg
            className="animate-spin h-12 w-12 text-blue-600 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600 text-lg">Analyzing your spending patterns...</p>
          <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
        </div>
      )}

      {/* Error State */}
      {showError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg
              className="h-6 w-6 text-red-600 mt-0.5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-red-800 font-semibold mb-1">Unable to Load Insights</h3>
              <p className="text-red-700 text-sm">
                {error instanceof Error
                  ? error.message
                  : 'There was an error loading your AI insights. Please try generating new insights.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {showNoData && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <svg
            className="h-16 w-16 text-gray-400 mx-auto mb-4"
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
          <h3 className="text-gray-700 font-semibold text-lg mb-2">No Insights Available</h3>
          <p className="text-gray-600 mb-4">
            Click "Generate Insights" to analyze your spending patterns and get personalized
            recommendations.
          </p>
        </div>
      )}

      {/* Insights Content */}
      {insights && !showLoading && (
        <div className="space-y-4 sm:space-y-6">
          <MonthlySummary summary={insights.monthlySummary} />
          <CategoryInsights insights={insights.categoryInsights} />
          {insights.spendingSpikes && insights.spendingSpikes.length > 0 && (
            <SpendingAlerts spikes={insights.spendingSpikes} />
          )}
          <Recommendations recommendations={insights.recommendations} />
          <Projections projections={insights.projections} />
        </div>
      )}
    </div>
  );
};
