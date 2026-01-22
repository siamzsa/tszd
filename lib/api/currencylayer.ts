import axios from 'axios';

const API_KEY = '1c828b92902718181d5d059fd764dd38';
const BASE_URL = 'https://apilayer.net/api';

export interface CurrencyRate {
  [key: string]: number;
}

export interface LiveRatesResponse {
  success: boolean;
  terms: string;
  privacy: string;
  timestamp: number;
  source: string;
  quotes: CurrencyRate;
}

export interface HistoricalRatesResponse {
  success: boolean;
  terms: string;
  privacy: string;
  historical: boolean;
  date: string;
  timestamp: number;
  source: string;
  quotes: CurrencyRate;
}

export class CurrencyLayerAPI {
  private apiKey: string;

  constructor(apiKey: string = API_KEY) {
    this.apiKey = apiKey;
  }

  /**
   * Get live exchange rates
   */
  async getLiveRates(currencies: string[], source: string = 'USD'): Promise<LiveRatesResponse> {
    try {
      const response = await axios.get<LiveRatesResponse>(`${BASE_URL}/live`, {
        params: {
          access_key: this.apiKey,
          currencies: currencies.join(','),
          source: source,
          format: 1,
        },
      });
      
      // Check if API returned an error in the response
      if (!response.data.success) {
        const errorInfo = (response.data as any).error?.info || 'Unknown API error';
        throw new Error(errorInfo);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching live rates:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.info || 'API request failed');
      }
      throw error;
    }
  }

  /**
   * Get historical exchange rates
   */
  async getHistoricalRates(
    date: string,
    currencies: string[],
    source: string = 'USD'
  ): Promise<HistoricalRatesResponse> {
    try {
      const response = await axios.get<HistoricalRatesResponse>(`${BASE_URL}/historical`, {
        params: {
          access_key: this.apiKey,
          date: date,
          currencies: currencies.join(','),
          source: source,
          format: 1,
        },
      });
      
      // Check if API returned an error in the response
      if (!response.data.success) {
        const errorInfo = (response.data as any).error?.info || 'Unknown API error';
        throw new Error(errorInfo);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching historical rates:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.info || 'API request failed');
      }
      throw error;
    }
  }

  /**
   * Get market data for analysis (current and historical)
   * For a pair like EUR/USD, we want 1 EUR = X USD
   * So we use EUR as source and request USD
   */
  async getMarketDataForAnalysis(
    currencyPair: string
  ): Promise<{
    current: LiveRatesResponse;
    historical: HistoricalRatesResponse[];
  }> {
    if (!currencyPair || !currencyPair.includes('/')) {
      throw new Error('Invalid currency pair format. Expected format: BASE/QUOTE (e.g., EUR/USD)');
    }

    const [base, quote] = currencyPair.split('/');
    
    if (!base || !quote) {
      throw new Error('Invalid currency pair. Both base and quote currencies are required.');
    }
    
    // Use base currency as source, request quote currency
    // This gives us 1 BASE = X QUOTE
    const apiSource = base;
    const targetCurrency = quote;
    const currencies = [targetCurrency];

    // Get current rates
    const current = await this.getLiveRates(currencies, apiSource);

    // Validate current rates
    const pairKey = `${current.source}${quote}`;
    if (!current.quotes || !current.quotes[pairKey]) {
      throw new Error(`Unable to fetch current rate for ${currencyPair}. The currency pair may not be supported.`);
    }

    // Get historical rates for last 7 days
    const historicalPromises: Promise<HistoricalRatesResponse>[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      historicalPromises.push(this.getHistoricalRates(dateStr, currencies, apiSource));
    }

    // Use Promise.allSettled to handle partial failures gracefully
    const historicalResults = await Promise.allSettled(historicalPromises);
    const historical: HistoricalRatesResponse[] = [];
    
    historicalResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        historical.push(result.value);
      } else {
        console.warn(`Failed to fetch historical data for day ${index + 1}:`, result.reason);
      }
    });

    // Ensure we have at least some historical data
    if (historical.length === 0) {
      throw new Error('Unable to fetch historical data. Please try again later.');
    }

    return { current, historical };
  }
}

export const currencyLayerAPI = new CurrencyLayerAPI();

