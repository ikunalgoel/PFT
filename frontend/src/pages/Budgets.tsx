import React, { useState } from 'react';
import { BudgetList } from '../components/BudgetList';
import { BudgetForm } from '../components/BudgetForm';
import { AlertBanner } from '../components/AlertBanner';

export const Budgets: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Alert Banner */}
      <AlertBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Budgets</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm sm:text-base"
        >
          Create Budget
        </button>
      </div>

      {/* Budget List */}
      <BudgetList />

      {/* Budget Form Modal */}
      {isFormOpen && (
        <BudgetForm
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};
