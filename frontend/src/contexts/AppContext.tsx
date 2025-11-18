import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DateRange {
  start: Date;
  end: Date;
}

interface AppContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  resetFilters: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

// Default date range: last 30 days
const getDefaultDateRange = (): DateRange => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return { start, end };
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const resetFilters = () => {
    setDateRange(getDefaultDateRange());
    setSelectedCategories([]);
  };

  const value = {
    dateRange,
    setDateRange,
    selectedCategories,
    setSelectedCategories,
    resetFilters,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
