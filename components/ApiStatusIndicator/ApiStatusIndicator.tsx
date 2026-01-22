'use client';

import { useState, useEffect } from 'react';
import { currencyLayerAPI, APIStatus } from '@/lib/api/currencylayer';

export default function ApiStatusIndicator() {
  const [apiStatus, setApiStatus] = useState<APIStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkAPIStatus = async () => {
    setIsChecking(true);
    try {
      const status = await currencyLayerAPI.validateAPI();
      setApiStatus(status);
    } catch (error) {
      setApiStatus({
        isValid: false,
        isConnected: false,
        message: 'Failed to check API status',
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check API status on component mount
    checkAPIStatus();
  }, []);

  if (isChecking) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
          <span className="text-sm text-yellow-700 dark:text-yellow-300">Checking API status...</span>
        </div>
      </div>
    );
  }

  if (!apiStatus) {
    return null;
  }

  if (apiStatus.isValid && apiStatus.isConnected) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              API Connected & Valid
            </span>
          </div>
          <button
            onClick={checkAPIStatus}
            className="text-xs text-green-600 dark:text-green-400 hover:underline"
          >
            Refresh
          </button>
        </div>
        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
          {apiStatus.message}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 bg-red-500 rounded-full"></div>
          <span className="text-sm font-medium text-red-700 dark:text-red-300">
            API Error
          </span>
        </div>
        <button
          onClick={checkAPIStatus}
          className="text-xs text-red-600 dark:text-red-400 hover:underline"
        >
          Retry
        </button>
      </div>
      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
        {apiStatus.message}
        {apiStatus.errorCode && ` (Code: ${apiStatus.errorCode})`}
      </p>
      <p className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium">
        ⚠️ Signals will not be generated until API is fixed.
      </p>
    </div>
  );
}

