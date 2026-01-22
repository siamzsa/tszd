'use client';

import { TradingSignal } from '@/lib/analysis/signalAnalyzer';

interface SignalDisplayProps {
  signal: TradingSignal | null;
  isLoading: boolean;
}

export default function SignalDisplay({ signal, isLoading }: SignalDisplayProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-4 text-gray-600 dark:text-gray-400">Analyzing market data...</span>
        </div>
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Select a market and click Generate to get trading signals
        </div>
      </div>
    );
  }

  const isBuy = signal.signal === 'BUY';
  const confidenceColor = 
    signal.confidence >= 70 ? 'text-green-600 dark:text-green-400' :
    signal.confidence >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
    'text-red-600 dark:text-red-400';

  const signalBgColor = isBuy 
    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';

  return (
    <div className="w-full space-y-6">
      {/* Main Signal Card */}
      <div className={`w-full rounded-xl shadow-lg p-8 border-2 ${signalBgColor}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Trading Signal
            </h3>
            <div className={`mt-2 text-5xl font-bold ${isBuy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {signal.signal}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Confidence
            </div>
            <div className={`mt-2 text-4xl font-bold ${confidenceColor}`}>
              {signal.confidence.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Confidence Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                signal.confidence >= 70 ? 'bg-green-500' :
                signal.confidence >= 50 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${signal.confidence}%` }}
            ></div>
          </div>
        </div>

        {/* Price Information */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
              Current Price
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {signal.currentPrice.toFixed(4)}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
              Price Change
            </div>
            <div className={`text-xl font-bold ${signal.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {signal.priceChange >= 0 ? '+' : ''}{signal.priceChange.toFixed(4)}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
              Change %
            </div>
            <div className={`text-xl font-bold ${signal.priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {signal.priceChangePercent >= 0 ? '+' : ''}{signal.priceChangePercent.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Trend:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              signal.trend === 'UP' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
              signal.trend === 'DOWN' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
              'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
            }`}>
              {signal.trend}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(signal.timestamp).toLocaleString()}
          </div>
        </div>

        {/* Analysis */}
        <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Analysis:
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {signal.analysis}
          </div>
        </div>
      </div>
    </div>
  );
}

