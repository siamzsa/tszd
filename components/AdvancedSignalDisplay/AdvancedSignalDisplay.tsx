'use client';

import { AdvancedTradingSignal } from '@/lib/analysis/advancedSignalAnalyzer';
import CountdownTimer from '@/components/CountdownTimer/CountdownTimer';

interface AdvancedSignalDisplayProps {
  signal: AdvancedTradingSignal | null;
  isLoading: boolean;
}

export default function AdvancedSignalDisplay({ signal, isLoading }: AdvancedSignalDisplayProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-4 text-gray-600 dark:text-gray-400">Analyzing market data with technical indicators...</span>
        </div>
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Select a market and click Generate to get professional trading signals
        </div>
      </div>
    );
  }

  const isBuy = signal.signal === 'BUY';
  const confidenceColor = 
    signal.confidence >= 80 ? 'text-green-600 dark:text-green-400' :
    signal.confidence >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
    signal.confidence >= 60 ? 'text-orange-600 dark:text-orange-400' :
    'text-red-600 dark:text-red-400';

  const signalBgColor = isBuy 
    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';

  const confirmationCount = Object.values(signal.confirmations).filter(Boolean).length;
  const totalConfirmations = Object.keys(signal.confirmations).length;

  return (
    <div className="w-full space-y-6">
      {/* Main Signal Card */}
      <div className={`w-full rounded-xl shadow-lg p-8 border-2 ${signalBgColor}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Signal and Confidence */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Trading Signal
            </h3>
            <div className={`text-5xl font-bold mb-2 ${isBuy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {signal.signal}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {confirmationCount}/{totalConfirmations} Confirmations
            </div>
          </div>

          {/* Confidence */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Confidence
            </h3>
            <div className={`text-5xl font-bold ${confidenceColor}`}>
              {signal.confidence.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Target: 80% Accuracy
            </div>
          </div>

          {/* Countdown Timer */}
          <div>
            <CountdownTimer targetTime={signal.nextCandleTime} label="Next 1-Min Candle" />
          </div>
        </div>

        {/* Confidence Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-500 ${
                signal.confidence >= 80 ? 'bg-green-500' :
                signal.confidence >= 70 ? 'bg-yellow-500' :
                signal.confidence >= 60 ? 'bg-orange-500' :
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

        {/* Technical Indicators Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">RSI</div>
            <div className={`text-lg font-bold ${
              signal.technicalIndicators.rsi > 70 ? 'text-red-600' :
              signal.technicalIndicators.rsi < 30 ? 'text-green-600' :
              'text-gray-600 dark:text-gray-300'
            }`}>
              {signal.technicalIndicators.rsi.toFixed(1)}
            </div>
            <div className={`text-xs mt-1 ${signal.confirmations.rsi ? 'text-green-600' : 'text-gray-400'}`}>
              {signal.confirmations.rsi ? '✓' : '✗'}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">MACD</div>
            <div className={`text-lg font-bold ${
              signal.technicalIndicators.macd.histogram > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {signal.technicalIndicators.macd.histogram > 0 ? '+' : ''}{signal.technicalIndicators.macd.histogram.toFixed(4)}
            </div>
            <div className={`text-xs mt-1 ${signal.confirmations.macd ? 'text-green-600' : 'text-gray-400'}`}>
              {signal.confirmations.macd ? '✓' : '✗'}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ADX</div>
            <div className={`text-lg font-bold ${
              signal.technicalIndicators.adx > 25 ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'
            }`}>
              {signal.technicalIndicators.adx.toFixed(1)}
            </div>
            <div className={`text-xs mt-1 ${signal.confirmations.adx ? 'text-green-600' : 'text-gray-400'}`}>
              {signal.confirmations.adx ? '✓' : '✗'}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Stochastic</div>
            <div className="text-lg font-bold text-gray-600 dark:text-gray-300">
              {signal.technicalIndicators.stochastic.k.toFixed(1)}
            </div>
            <div className={`text-xs mt-1 ${signal.confirmations.stochastic ? 'text-green-600' : 'text-gray-400'}`}>
              {signal.confirmations.stochastic ? '✓' : '✗'}
            </div>
          </div>
        </div>

        {/* Confirmations */}
        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Signal Confirmations:
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(signal.confirmations).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <span className={value ? 'text-green-600' : 'text-gray-400'}>
                  {value ? '✓' : '✗'}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  {key}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekend Direction */}
        {signal.weekendDirection && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Weekend Direction Prediction:
            </div>
            <div className={`text-2xl font-bold ${
              signal.weekendDirection === 'UP' ? 'text-green-600' :
              signal.weekendDirection === 'DOWN' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {signal.weekendDirection}
            </div>
          </div>
        )}

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

        {/* Detailed Analysis */}
        <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Professional Analysis:
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {signal.analysis}
          </div>
        </div>
      </div>
    </div>
  );
}


