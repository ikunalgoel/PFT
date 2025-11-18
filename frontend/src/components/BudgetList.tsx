import React, { useState } from 'react';
import { Budget } from '../types/budget';
import { useBudgets, useDeleteBudget } from '../hooks/useBudgets';
import { BudgetCard } from './BudgetCard';
import { BudgetForm } from './BudgetForm';

export const BudgetList: React.FC = () => {
  const { data: budgets, isLoading, error } = useBudgets();
  const deleteBudget = useDeleteBudget();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>(undefined);

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete budget:', error);
        alert('Failed to delete budget. Please try again.');
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBudget(undefined);
  };

  const handleCreateNew = () => {
    setEditingBudget(undefined);
    setIsFormOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Failed to load budgets. Please try again.</p>
      </div>
    );
  }

  if (!budgets || budgets.length === 0) {
    return (
      <>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No budgets yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Create your first budget to start tracking spending limits.
          </p>
          <button
            onClick={handleCreateNew}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Budget
          </button>
        </div>

        {isFormOpen && (
          <BudgetForm
            budget={editingBudget}
            onClose={handleCloseForm}
            onSuccess={handleCloseForm}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => (
          <BudgetCard
            key={budget.id}
            budget={budget}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {isFormOpen && (
        <BudgetForm
          budget={editingBudget}
          onClose={handleCloseForm}
          onSuccess={handleCloseForm}
        />
      )}
    </>
  );
};
