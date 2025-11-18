import React, { useState, useEffect } from 'react';
import { Budget, BudgetInput } from '../types/budget';
import { useCreateBudget, useUpdateBudget } from '../hooks/useBudgets';
import { useCurrency } from '../contexts/CurrencyContext';

interface BudgetFormProps {
  budget?: Budget;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ budget, onClose, onSuccess }) => {
  const { currencySymbol } = useCurrency();
  const [formData, setFormData] = useState<BudgetInput>({
    name: '',
    amount: 0,
    periodType: 'monthly',
    periodStart: '',
    periodEnd: '',
    category: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();

  // Populate form if editing
  useEffect(() => {
    if (budget) {
      setFormData({
        name: budget.name,
        amount: budget.amount,
        periodType: budget.periodType,
        periodStart: budget.periodStart || '',
        periodEnd: budget.periodEnd || '',
        category: budget.category || '',
      });
    }
  }, [budget]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Budget name is required';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (formData.periodType === 'custom') {
      if (!formData.periodStart) {
        newErrors.periodStart = 'Start date is required for custom period';
      }
      if (!formData.periodEnd) {
        newErrors.periodEnd = 'End date is required for custom period';
      }
      if (formData.periodStart && formData.periodEnd) {
        const start = new Date(formData.periodStart);
        const end = new Date(formData.periodEnd);
        if (end <= start) {
          newErrors.periodEnd = 'End date must be after start date';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Clean up data based on period type
      const submitData: BudgetInput = {
        ...formData,
        category: formData.category?.trim() || undefined,
      };

      if (formData.periodType === 'monthly') {
        delete submitData.periodStart;
        delete submitData.periodEnd;
      }

      if (budget) {
        await updateBudget.mutateAsync({ id: budget.id, data: submitData });
      } else {
        await createBudget.mutateAsync(submitData);
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      setErrors({
        submit: error.response?.data?.message || 'Failed to save budget',
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {budget ? 'Edit Budget' : 'Create Budget'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 active:text-gray-800 p-1 rounded hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {/* Budget Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Budget Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Monthly Groceries"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">{currencySymbol}</span>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount || ''}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Period Type */}
          <div>
            <label htmlFor="periodType" className="block text-sm font-medium text-gray-700 mb-1">
              Period Type *
            </label>
            <select
              id="periodType"
              name="periodType"
              value={formData.periodType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="monthly">Monthly</option>
              <option value="custom">Custom Period</option>
            </select>
          </div>

          {/* Custom Period Dates */}
          {formData.periodType === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="periodStart" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="periodStart"
                  name="periodStart"
                  value={formData.periodStart}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.periodStart ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.periodStart && (
                  <p className="mt-1 text-sm text-red-600">{errors.periodStart}</p>
                )}
              </div>
              <div>
                <label htmlFor="periodEnd" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  id="periodEnd"
                  name="periodEnd"
                  value={formData.periodEnd}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.periodEnd ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.periodEnd && (
                  <p className="mt-1 text-sm text-red-600">{errors.periodEnd}</p>
                )}
              </div>
            </div>
          )}

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category (Optional)
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Groceries, Entertainment"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to track all categories
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 sticky bottom-0 bg-white pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 sm:py-2 border border-gray-300 text-gray-700 text-sm sm:text-base rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createBudget.isPending || updateBudget.isPending}
              className="flex-1 px-4 py-2.5 sm:py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createBudget.isPending || updateBudget.isPending
                ? 'Saving...'
                : budget
                ? 'Update Budget'
                : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
