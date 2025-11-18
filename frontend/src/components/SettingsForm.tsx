import React, { useState, useEffect } from 'react';
import { Currency, UserSettings } from '../types/settings';
import { CurrencySelector } from './CurrencySelector';
import { useUpdateSettings } from '../hooks/useSettings';

interface SettingsFormProps {
  settings: UserSettings;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ settings }) => {
  const [currency, setCurrency] = useState<Currency>(settings.currency);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSettings = useUpdateSettings();

  useEffect(() => {
    setHasChanges(currency !== settings.currency);
  }, [currency, settings.currency]);

  const handleSave = async () => {
    if (!hasChanges) return;

    await updateSettings.mutateAsync({ currency });
  };

  const handleCancel = () => {
    setCurrency(settings.currency);
    setHasChanges(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferences</h2>
        
        <CurrencySelector
          value={currency}
          onChange={setCurrency}
          disabled={updateSettings.isPending}
        />

        <p className="mt-2 text-sm text-gray-500">
          This will change how all monetary amounts are displayed throughout the app.
          Existing transaction amounts will not be converted.
        </p>
      </div>

      {hasChanges && (
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            disabled={updateSettings.isPending}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};
