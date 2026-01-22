'use client';

import { useState } from 'react';
import MarketSelector from '@/components/MarketSelector/MarketSelector';
import GenerateButton from '@/components/GenerateButton/GenerateButton';
import AdvancedSignalDisplay from '@/components/AdvancedSignalDisplay/AdvancedSignalDisplay';
import ApiStatusIndicator from '@/components/ApiStatusIndicator/ApiStatusIndicator';
import { currencyLayerAPI } from '@/lib/api/currencylayer';
import { advancedSignalAnalyzer, AdvancedTradingSignal } from '@/lib/analysis/advancedSignalAnalyzer';

export default function Home() {
  const [selectedMarket, setSelectedMarket] = useState<string>('');
  const [signal, setSignal] = useState<AdvancedTradingSignal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSignal = async () => {
    if (!selectedMarket) {
      setError('Please select a market first');
      return;
    }

    // Prevent multiple simultaneous calls
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSignal(null);

    try {
      // Get market data from API (with automatic retry built-in)
      const marketData = await currencyLayerAPI.getMarketDataForAnalysis(selectedMarket);
      
      // Quick validation - be more lenient
      if (!marketData.current) {
        throw new Error('Invalid API response: No current market data received.');
      }

      if (!marketData.current.quotes || Object.keys(marketData.current.quotes).length === 0) {
        throw new Error('Invalid API response: No exchange rate data received.');
      }

      // Find any valid rate (more flexible)
      const [base, quote] = selectedMarket.split('/');
      const pairKey = `${marketData.current.source}${quote}`;
      
      // Try multiple ways to get the rate
      let hasRate = marketData.current.quotes[pairKey];
      
      if (!hasRate || hasRate === 0) {
        // Try alternative keys
        const altKey = Object.keys(marketData.current.quotes).find(key => 
          key.includes(base) || key.includes(quote)
        );
        if (altKey) {
          hasRate = marketData.current.quotes[altKey];
        } else {
          // Use first available rate as fallback
          hasRate = Object.values(marketData.current.quotes)[0] as number;
        }
      }

      if (!hasRate || hasRate === 0) {
        throw new Error(`Unable to get valid exchange rate for ${selectedMarket}. Please try another currency pair.`);
      }

      // Analyze with advanced technical indicators
      // This should always work if we have current data
      const generatedSignal = advancedSignalAnalyzer.analyzeMarket(
        selectedMarket,
        marketData.current,
        marketData.historical || []
      );

      // Signal successfully generated - clear any previous errors
      setSignal(generatedSignal);
      setError(null);
    } catch (err: any) {
      console.error('Error generating signal:', err);
      
      let errorMessage = 'Failed to generate signal. Please try again.';
      
      // Extract meaningful error message
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.error?.info) {
        errorMessage = err.response.data.error.info;
      } else if (err.response?.data?.error?.message) {
        errorMessage = err.response.data.error.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Clear signal if there's an error
      setSignal(null);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-block mb-3">
            <span className="px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-full">
              PROFESSIONAL TRADING SYSTEM
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Binary Trading Signal Board
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 font-medium">
            Advanced Technical Analysis • 80% Accuracy Target • 1-Minute Candle Analysis
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 md:p-6 border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Market Selection
                </h2>
              </div>
              
              {/* API Status Indicator */}
              <div className="mb-4">
                <ApiStatusIndicator />
              </div>
              
              <div className="space-y-6">
                <MarketSelector
                  onMarketSelect={setSelectedMarket}
                  selectedMarket={selectedMarket}
                />
                
                <GenerateButton
                  onClick={handleGenerateSignal}
                  disabled={!selectedMarket}
                  isLoading={isLoading}
                />
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <span className="text-red-600 dark:text-red-400 text-lg">⚠️</span>
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                        Signal Generation Failed
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                      <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                        Note: Signals are only generated when API is valid and working correctly.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl shadow-lg p-6 border border-primary-200 dark:border-primary-800">
              <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-3">
                How it works
              </h3>
              <ul className="space-y-2 text-sm text-primary-800 dark:text-primary-200">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span>Select a currency pair from the dropdown</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span>Click Generate Signal button</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span>Advanced AI analyzes with RSI, MACD, Bollinger Bands, EMA, ADX & Stochastic indicators</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">4.</span>
                  <span>Get 1-minute candle analysis with real-time countdown timer</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">5.</span>
                  <span>Target: 80% accuracy (8 profitable signals out of 10)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Panel - Signal Display */}
          <div className="lg:col-span-2">
            <div className="sticky top-4 z-10">
              <AdvancedSignalDisplay signal={signal} isLoading={isLoading} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Powered by CurrencyLayer API • Advanced Technical Analysis • Professional Trading Signals</p>
          <p className="mt-1 text-xs">RSI • MACD • Bollinger Bands • EMA • ADX • Stochastic • 1-Minute Candle Analysis</p>
        </div>
      </div>
    </main>
  );
}
