import React from 'react';
import { SpendingSpike } from '../types/insights';

interface SpendingAlertsProps {
  spikes: SpendingSpike[];
}

export const SpendingAlerts: React.FC<SpendingAlertsProps> = ({ spikes }) => {
  if (!spikes || spikes.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 pb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg
          className="h-5 w-5 text-yellow-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        Unusual Spending Patterns
      </h3>
      <div className="space-y-3">
        {spikes.map((spike, index) => (
          <div
            key={index}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:bg-yellow-100 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-gray-900">{spike.category}</p>
                <p className="text-sm text-gray-600">
                  {new Date(spike.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <p className="text-lg font-bold text-yellow-700">${spike.amount.toFixed(2)}</p>
            </div>
            <p className="text-gray-700 text-sm">{spike.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
