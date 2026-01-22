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
      <div className="w-full bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8 md:p-12 border-2 border-dashed border-blue-200 dark:border-gray-700">
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
            Ready to Generate Signal
          </h3>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Select a market from the dropdown and click &quot;Generate Signal&quot; to get professional trading signals with advanced technical analysis
          </p>
          <div className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-semibold">
              Signal will appear here after generation
            </span>
          </div>
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
    <div className="w-full space-y-6 animate-fadeIn">
      {/* Main Signal Card */}
      <div className={`w-full rounded-2xl shadow-2xl p-6 md:p-8 border-2 ${signalBgColor} transform transition-all duration-300 hover:shadow-3xl relative overflow-hidden`}>
        {/* Decorative gradient overlay */}
        <div className={`absolute top-0 right-0 w-64 h-64 ${isBuy ? 'bg-green-200' : 'bg-red-200'} dark:${isBuy ? 'bg-green-900' : 'bg-red-900'} opacity-10 rounded-full blur-3xl -mr-32 -mt-32`}></div>
        <div className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          {/* Signal and Confidence */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Trading Signal
            </h3>
            <div className={`text-4xl md:text-5xl font-black mb-2 ${isBuy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} drop-shadow-lg`}>
              {signal.signal}
            </div>
            <div className="flex items-center space-x-2 text-xs font-medium text-gray-600 dark:text-gray-400">
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                {confirmationCount}/{totalConfirmations}
              </span>
              <span>Confirmations</span>
            </div>
          </div>

          {/* Confidence */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Confidence
            </h3>
            <div className={`text-4xl md:text-5xl font-black ${confidenceColor} drop-shadow-lg`}>
              {signal.confidence.toFixed(0)}%
            </div>
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                Target: 80%
              </span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <CountdownTimer targetTime={signal.nextCandleTime} label="Next 1-Min Candle" />
          </div>
        </div>

        {/* Confidence Bar */}
        <div className="mb-6 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Confidence Level</span>
            <span className={`text-xs font-bold ${confidenceColor}`}>
              {signal.confidence.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-5 shadow-inner">
            <div
              className={`h-5 rounded-full transition-all duration-700 shadow-lg ${
                signal.confidence >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                signal.confidence >= 70 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                signal.confidence >= 60 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                'bg-gradient-to-r from-red-500 to-red-600'
              }`}
              style={{ width: `${signal.confidence}%` }}
            ></div>
          </div>
        </div>

        {/* Price Information */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 relative z-10">
          <div className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-md">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 tracking-wide">
              Current Price
            </div>
            <div className="text-lg md:text-xl font-black text-gray-900 dark:text-white">
              {signal.currentPrice.toFixed(4)}
            </div>
          </div>
          <div className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-md">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 tracking-wide">
              Price Change
            </div>
            <div className={`text-lg md:text-xl font-black ${signal.priceChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {signal.priceChange >= 0 ? '+' : ''}{signal.priceChange.toFixed(4)}
            </div>
          </div>
          <div className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-md">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 tracking-wide">
              Change %
            </div>
            <div className={`text-lg md:text-xl font-black ${signal.priceChangePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {signal.priceChangePercent >= 0 ? '+' : ''}{signal.priceChangePercent.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Technical Indicators Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 relative z-10">
          <div className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-600 shadow-md">
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

          <div className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-600 shadow-md">
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

          <div className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-600 shadow-md">
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

          <div className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-200 dark:border-gray-600 shadow-md">
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
        <div className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-xl p-4 md:p-5 mb-6 border border-gray-200 dark:border-gray-600 shadow-md relative z-10">
          <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 rounded-xl p-5 mb-6 border-2 border-blue-200 dark:border-blue-800 shadow-lg relative z-10">
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Weekend Direction Prediction:
              </div>
            </div>
            <div className={`text-3xl font-black ${
              signal.weekendDirection === 'UP' ? 'text-green-600 dark:text-green-400' :
              signal.weekendDirection === 'DOWN' ? 'text-red-600 dark:text-red-400' :
              'text-gray-600 dark:text-gray-400'
            }`}>
              {signal.weekendDirection}
            </div>
          </div>
        )}

        {/* Trend Indicator */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Trend:</span>
            <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${
              signal.trend === 'UP' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' :
              signal.trend === 'DOWN' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
              'bg-gray-500 text-white'
            }`}>
              {signal.trend}
            </span>
          </div>
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 px-3 py-1 rounded-lg">
            {new Date(signal.timestamp).toLocaleString()}
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-xl p-5 border border-gray-200 dark:border-gray-600 shadow-md relative z-10">
          <div className="flex items-center mb-3">
            <svg className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Professional Analysis:
            </div>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
            {signal.analysis}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}


