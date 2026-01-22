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

    setIsLoading(true);
    setError(null);
    setSignal(null);

    try {
      // Get market data from API
      const marketData = await currencyLayerAPI.getMarketDataForAnalysis(selectedMarket);
      
      // Validate that we have current data
      if (!marketData.current) {
        throw new Error('Invalid API response: No current market data received.');
      }

      if (!marketData.current.quotes || Object.keys(marketData.current.quotes).length === 0) {
        throw new Error('Invalid API response: No exchange rate data received.');
      }

      // Check if we have at least some data for analysis
      const [base, quote] = selectedMarket.split('/');
      const pairKey = `${marketData.current.source}${quote}`;
      const hasRate = marketData.current.quotes[pairKey] || 
                     Object.values(marketData.current.quotes)[0];

      if (!hasRate || hasRate === 0) {
        throw new Error(`Unable to get valid exchange rate for ${selectedMarket}. Please try another currency pair.`);
      }

      // Analyze with advanced technical indicators
      const generatedSignal = advancedSignalAnalyzer.analyzeMarket(
        selectedMarket,
        marketData.current,
        marketData.historical || []
      );

      // Signal successfully generated
      setSignal(generatedSignal);
      setError(null);
    } catch (err: any) {
      console.error('Error generating signal:', err);
      
      let errorMessage = 'Failed to generate signal.';
      
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Professional Binary Trading Signal Board
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Advanced Technical Analysis • 80% Accuracy Target • 1-Minute Candle Analysis
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Market Selection
              </h2>
              
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
            <AdvancedSignalDisplay signal={signal} isLoading={isLoading} />
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
