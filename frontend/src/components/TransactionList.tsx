import React, { useState, useMemo } from 'react';
import { Transaction } from '../types/transaction';
import { useCurrency } from '../contexts/CurrencyContext';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

type SortField = 'date' | 'amount' | 'category' | 'merchant';
type SortOrder = 'asc' | 'desc';

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const { formatAmount: formatCurrency } = useCurrency();
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = new Set(transactions.map((t) => t.category));
    return Array.from(uniqueCategories).sort();
  }, [transactions]);

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Apply category filter
    if (filterCategory) {
      filtered = filtered.filter((t) => t.category === filterCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortField] || '';
      let bValue: string | number = b[sortField] || '';

      if (sortField === 'amount') {
        aValue = a.amount;
        bValue = b.amount;
      } else if (sortField === 'date') {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [transactions, filterCategory, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedTransactions, currentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return formatCurrency(amount);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 text-center">
          <p className="text-gray-500">
            No transactions yet. Add your first transaction to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filters */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Category
            </label>
            <select
              id="category-filter"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <span className="text-xs sm:text-sm text-gray-600">
              Showing {filteredAndSortedTransactions.length} transaction(s)
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('date')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-1">
                  Date
                  {sortField === 'date' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('category')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-1">
                  Category
                  {sortField === 'category' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('merchant')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-1">
                  Merchant
                  {sortField === 'merchant' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('amount')}
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center justify-end gap-1">
                  Amount
                  {sortField === 'amount' && (
                    <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {transaction.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.merchant || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                  {formatAmount(transaction.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(transaction)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(transaction.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200">
        {paginatedTransactions.map((transaction) => (
          <div key={transaction.id} className="p-4 hover:bg-gray-50 active:bg-gray-100">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {transaction.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(transaction.date)}
                  </span>
                </div>
                {transaction.merchant && (
                  <p className="text-sm text-gray-700">{transaction.merchant}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  {formatAmount(transaction.amount)}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => onEdit(transaction)}
                className="flex-1 px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 active:bg-blue-100 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(transaction.id)}
                className="flex-1 px-3 py-2 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 active:bg-red-100 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-xs sm:text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 sm:py-1 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 sm:py-1 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
