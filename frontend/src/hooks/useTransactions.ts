import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../lib/axios';
import { Transaction, TransactionInput } from '../types/transaction';
import { useToast } from '../contexts/ToastContext';
import { getErrorMessage } from '../lib/axios';

// Fetch all transactions
export const useTransactions = () => {
  const { showError } = useToast();

  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/transactions');
        // Backend returns { count, transactions }, extract transactions array
        return response.data.transactions || response.data;
      } catch (error) {
        showError(getErrorMessage(error));
        throw error;
      }
    },
  });
};

// Create a single transaction
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: TransactionInput) => {
      const response = await axios.post('/api/transactions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      showSuccess('Transaction created successfully');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
};

// Update a transaction
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TransactionInput }) => {
      const response = await axios.put(`/api/transactions/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      showSuccess('Transaction updated successfully');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
};

// Delete a transaction
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      showSuccess('Transaction deleted successfully');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
};

// Bulk upload transactions
export const useBulkUploadTransactions = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (transactions: TransactionInput[]) => {
      const response = await axios.post('/api/transactions/bulk', { transactions });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      showSuccess(`Successfully uploaded ${data.count || data.length} transactions`);
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
};
