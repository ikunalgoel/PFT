import React, { useState, useEffect } from 'react';
import { Transaction, TransactionInput } from '../types/transaction';
import { useCurrency } from '../contexts/CurrencyContext';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionInput) => Promise<void>;
  transaction?: Transaction | null;
  mode: 'create' | 'edit';
}

const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Personal Care',
  'Other',
];

export const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  transaction,
  mode,
}) => {
  const { currencySymbol } = useCurrency();
  const [formData, setFormData] = useState<TransactionInput>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    category: '',
    merchant: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TransactionInput, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Reset form when transaction changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && transaction) {
        setFormData({
          date: transaction.date.split('T')[0],
          amount: transaction.amount,
          category: transaction.category,
          merchant: transaction.merchant || '',
          notes: transaction.notes || '',
        });
      } else {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          amount: 0,
          category: '',
          merchant: '',
          notes: '',
        });
      }
      setErrors({});
      setSubmitError('');
      setSubmitSuccess(false);
    }
  }, [isOpen, transaction, mode]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TransactionInput, string>> = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      setSubmitSuccess(true);
      
      // Close modal after short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error: any) {
      setSubmitError(
        error.response?.data?.message || 
        error.message || 
        'Failed to save transaction. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
    
    // Clear error for this field
    if (errors[name as keyof TransactionInput]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-4 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full mx-4 sm:mx-0">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-4 pb-4 sm:p-6 sm:pb-4">
              <div className="mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-medium leading-6 text-gray-900">
                  {mode === 'create' ? 'Add Transaction' : 'Edit Transaction'}
                </h3>
              </div>

              {/* Success Message */}
              {submitSuccess && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  Transaction saved successfully!
                </div>
              )}

              {/* Error Message */}
              {submitError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {submitError}
                </div>
              )}

              <div className="space-y-4">
                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount <span className="text-red-500">*</span>
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
                      className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.amount ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                  )}
                </div>

                {/* Merchant */}
                <div>
                  <label htmlFor="merchant" className="block text-sm font-medium text-gray-700 mb-1">
                    Merchant
                  </label>
                  <input
                    type="text"
                    id="merchant"
                    name="merchant"
                    value={formData.merchant}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Starbucks"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any additional notes..."
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2.5 sm:py-2 bg-white text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || submitSuccess}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2.5 sm:py-2 bg-blue-600 text-sm sm:text-base font-medium text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Transaction' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
