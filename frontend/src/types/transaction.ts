export interface Transaction {
  id: string;
  userId: string;
  date: string;
  amount: number;
  category: string;
  merchant?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionInput {
  date: string;
  amount: number;
  category: string;
  merchant?: string;
  notes?: string;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
}
