import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '../lib/axios';
import { AIInsights, GenerateInsightsRequest, ExportInsightsRequest } from '../types/insights';
import { useToast } from '../contexts/ToastContext';
import { getErrorMessage } from '../lib/axios';

// Fetch latest insights
export const useLatestInsights = () => {
  const { showError } = useToast();

  return useQuery<AIInsights>({
    queryKey: ['insights', 'latest'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/insights/latest');
        return response.data;
      } catch (error) {
        showError(getErrorMessage(error));
        throw error;
      }
    },
    retry: false,
  });
};

// Generate new insights
export const useGenerateInsights = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation<AIInsights, Error, GenerateInsightsRequest>({
    mutationFn: async (data: GenerateInsightsRequest) => {
      const response = await axios.post('/api/insights/generate', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights', 'latest'] });
      showSuccess('AI insights generated successfully');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
};

// Export insights
export const useExportInsights = () => {
  const { showSuccess, showError } = useToast();

  return useMutation<Blob, Error, ExportInsightsRequest>({
    mutationFn: async (data: ExportInsightsRequest) => {
      const response = await axios.post('/api/insights/export', data, {
        responseType: 'blob',
      });
      return response.data;
    },
    onSuccess: () => {
      showSuccess('Insights exported successfully');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
};
