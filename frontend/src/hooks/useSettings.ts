import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../lib/axios';
import { UserSettings, UserSettingsInput } from '../types/settings';
import { useToast } from '../contexts/ToastContext';

/**
 * Fetch user settings
 */
const fetchSettings = async (): Promise<UserSettings> => {
  const { data } = await axios.get('/settings');
  return data;
};

/**
 * Update user settings
 */
const updateSettings = async (input: Partial<UserSettingsInput>): Promise<UserSettings> => {
  const { data } = await axios.put('/settings', input);
  return data;
};

/**
 * Update currency preference
 */
const updateCurrency = async (currency: string): Promise<UserSettings> => {
  const { data } = await axios.post('/settings/currency', { currency });
  return data;
};

/**
 * Hook to fetch user settings
 */
export const useSettings = () => {
  return useQuery<UserSettings, Error>({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to update user settings
 */
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<UserSettings, Error, Partial<UserSettingsInput>>({
    mutationFn: updateSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      showToast('success', 'Settings updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update settings';
      showToast('error', message);
    },
  });
};

/**
 * Hook to update currency preference
 */
export const useUpdateCurrency = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation<UserSettings, Error, string>({
    mutationFn: updateCurrency,
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      showToast('success', 'Currency updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update currency';
      showToast('error', message);
    },
  });
};
