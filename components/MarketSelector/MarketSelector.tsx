'use client';

import { useState } from 'react';

interface MarketSelectorProps {
  onMarketSelect: (market: string) => void;
  selectedMarket: string;
}

const AVAILABLE_MARKETS = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'USD/CAD',
  'AUD/USD',
  'USD/CHF',
  'NZD/USD',
  'EUR/GBP',
  'EUR/JPY',
  'GBP/JPY',
  'USD/PLN',
  'USD/ZAR',
];

export default function MarketSelector({ onMarketSelect, selectedMarket }: MarketSelectorProps) {
  return (
    <div className="w-full">
      <label htmlFor="market-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Market
      </label>
      <select
        id="market-select"
        value={selectedMarket}
        onChange={(e) => onMarketSelect(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-primary-500 focus:border-transparent
                   transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <option value="">-- Select a Market --</option>
        {AVAILABLE_MARKETS.map((market) => (
          <option key={market} value={market}>
            {market}
          </option>
        ))}
      </select>
    </div>
  );
}


