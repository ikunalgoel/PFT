import React from 'react';
import { useSettings } from '../hooks/useSettings';
import { SettingsForm } from '../components/SettingsForm';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export const Settings: React.FC = () => {
  const { data: settings, isLoading, error } = useSettings();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <ErrorMessage message="Failed to load settings" />
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
      
      <SettingsForm settings={settings} />
    </div>
  );
};
