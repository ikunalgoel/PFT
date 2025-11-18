import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useTransactions } from '../hooks/useTransactions';

export const FilterBar: React.FC = () => {
  const { dateRange, setDateRange, selectedCategories, setSelectedCategories, resetFilters } = useApp();
  const { data: transactions } = useTransactions();

  // Local state for form inputs
  const [startDate, setStartDate] = useState(dateRange.start.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(dateRange.end.toISOString().split('T')[0]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Extract unique categories from transactions
  const availableCategories = React.useMemo(() => {
    if (!transactions) return [];
    const categories = new Set(transactions.map(t => t.category));
    return Array.from(categories).sort();
  }, [transactions]);

  // Update local state when context changes
  useEffect(() => {
    setStartDate(dateRange.start.toISOString().split('T')[0]);
    setEndDate(dateRange.end.toISOString().split('T')[0]);
  }, [dateRange]);

  const handleDateChange = () => {
    setDateRange({
      start: new Date(startDate),
      end: new Date(endDate),
    });
  };

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleReset = () => {
    resetFilters();
    setShowCategoryDropdown(false);
  };

  const handleQuickFilter = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setDateRange({ start, end });
  };

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow space-y-3 sm:space-y-4">
      <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:items-end sm:gap-4">
        {/* Date Range Picker */}
        <div className="flex-1 min-w-full sm:min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onBlur={handleDateChange}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="hidden sm:flex items-center text-gray-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onBlur={handleDateChange}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickFilter(7)}
            className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            7 days
          </button>
          <button
            onClick={() => handleQuickFilter(30)}
            className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            30 days
          </button>
          <button
            onClick={() => handleQuickFilter(90)}
            className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            90 days
          </button>
        </div>

        {/* Category Filter */}
        <div className="relative w-full sm:w-auto">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categories
          </label>
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 flex items-center justify-between gap-2 transition-colors"
          >
            <span>
              {selectedCategories.length === 0
                ? 'All Categories'
                : `${selectedCategories.length} selected`}
            </span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Category Dropdown */}
          {showCategoryDropdown && (
            <div className="absolute z-10 mt-1 w-full sm:w-64 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {availableCategories.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500">
                  No categories available
                </div>
              ) : (
                availableCategories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer active:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="mr-3 h-4 w-4"
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="w-full sm:w-auto px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          Reset Filters
        </button>
      </div>

      {/* Active Filters Display */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
          <span className="text-xs sm:text-sm text-gray-600">Active filters:</span>
          {selectedCategories.map((category) => (
            <span
              key={category}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm rounded"
            >
              {category}
              <button
                onClick={() => handleCategoryToggle(category)}
                className="hover:text-blue-900 p-0.5"
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
