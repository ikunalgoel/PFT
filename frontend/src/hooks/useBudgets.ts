import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../lib/axios';
import { Budget, BudgetInput, BudgetProgress } from '../types/budget';
import { useToast } from '../contexts/ToastContext';
import { getErrorMessage } from '../lib/axios';

// Fetch all budgets
export const useBudgets = () => {
  const { showError } = useToast();

  return useQuery<Budget[]>({
    queryKey: ['budgets'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/budgets');
        const data = response.data;
        // Handle wrapped response
        return data.budgets || data;
      } catch (error) {
        showError(getErrorMessage(error));
        throw error;
      }
    },
  });
};

// Fetch budget progress
export const useBudgetProgress = (budgetId: string) => {
  const { showError } = useToast();

  return useQuery<BudgetProgress>({
    queryKey: ['budgets', budgetId, 'progress'],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/budgets/${budgetId}/progress`);
        return response.data;
      } catch (error) {
        showError(getErrorMessage(error));
        throw error;
      }
    },
    enabled: !!budgetId,
  });
};

// Create a budget
export const useCreateBudget = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: BudgetInput) => {
      const response = await axios.post('/api/budgets', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      showSuccess('Budget created successfully');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
};

// Update a budget
export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BudgetInput }) => {
      const response = await axios.put(`/api/budgets/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      showSuccess('Budget updated successfully');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
};

// Delete a budget
export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/budgets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      showSuccess('Budget deleted successfully');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
};
