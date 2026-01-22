import axios from 'axios';

const API_KEY = '0f10c2e281846ebc5f36eb6abce2b443';
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

export interface APIStatus {
  isValid: boolean;
  isConnected: boolean;
  message: string;
  errorCode?: string;
}

export class CurrencyLayerAPI {
  private apiKey: string;

  constructor(apiKey: string = API_KEY) {
    this.apiKey = apiKey;
  }

  /**
   * Validate API key and connection
   * Returns true only if API is working correctly
   */
  async validateAPI(): Promise<APIStatus> {
    try {
      // Test with a common currency pair (EUR/USD)
      const response = await axios.get<LiveRatesResponse>(`${BASE_URL}/live`, {
        params: {
          access_key: this.apiKey,
          currencies: 'EUR',
          source: 'USD',
          format: 1,
        },
        timeout: 15000, // 15 second timeout
      });

      // Check if API returned success
      if (!response.data.success) {
        const errorCode = (response.data as any).error?.code;
        const errorInfo = (response.data as any).error?.info || 'API validation failed';
        
        // Check for specific error codes that might be recoverable
        if (errorCode === '101' || errorCode === '102') {
          return {
            isValid: false,
            isConnected: false,
            message: `API Key Error: ${errorInfo}. Please check your API key.`,
            errorCode: errorCode,
          };
        }
        
        return {
          isValid: false,
          isConnected: false,
          message: errorInfo,
          errorCode: errorCode,
        };
      }

      // Check if we got valid data
      if (!response.data.quotes || Object.keys(response.data.quotes).length === 0) {
        return {
          isValid: false,
          isConnected: true,
          message: 'API connected but returned empty data',
        };
      }

      return {
        isValid: true,
        isConnected: true,
        message: 'API is valid and connected successfully',
      };
    } catch (error: any) {
      console.error('API validation error:', error);
      
      let message = 'Failed to connect to API';
      let errorCode: string | undefined;

      if (error.response) {
        // API returned an error response
        const apiError = error.response.data?.error;
        if (apiError) {
          message = apiError.info || 'API request failed';
          errorCode = apiError.code;
          
          // Provide helpful messages for common errors
          if (apiError.code === '101') {
            message = 'Invalid API key. Please check your API key.';
          } else if (apiError.code === '104') {
            message = 'Monthly API request limit reached. Please upgrade your plan.';
          } else if (apiError.code === '103') {
            message = 'Invalid API function. Please contact support.';
          }
        } else {
          message = `API returned error: ${error.response.status}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        message = 'No response from API server. Please check your internet connection.';
      } else if (error.code === 'ECONNABORTED') {
        message = 'API request timeout. Please try again.';
      } else {
        message = error.message || 'Unknown API error';
      }

      return {
        isValid: false,
        isConnected: false,
        message,
        errorCode,
      };
    }
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

    // Get current rates - try direct call first
    let current: LiveRatesResponse;
    try {
      current = await this.getLiveRates(currencies, apiSource);
    } catch (error: any) {
      // If direct call fails, try with USD as source (more common)
      if (apiSource !== 'USD') {
        try {
          console.log(`Trying alternative: Using USD as source for ${currencyPair}`);
          const usdCurrencies = [base, quote];
          const usdResponse = await this.getLiveRates(usdCurrencies, 'USD');
          
          // Convert to the format we need
          const baseKey = `USD${base}`;
          const quoteKey = `USD${quote}`;
          
          if (usdResponse.quotes[baseKey] && usdResponse.quotes[quoteKey]) {
            // Calculate cross rate
            const baseRate = usdResponse.quotes[baseKey];
            const quoteRate = usdResponse.quotes[quoteKey];
            const crossRate = quoteRate / baseRate;
            
            // Create a modified response
            current = {
              ...usdResponse,
              source: base,
              quotes: {
                [`${base}${quote}`]: crossRate
              }
            };
          } else {
            throw error; // Use original error
          }
        } catch (altError) {
          // If alternative also fails, use original error
          let errorMsg = error.message || 'API call failed';
          
          if (error.response?.data?.error) {
            const apiError = error.response.data.error;
            if (apiError.code === '101') {
              errorMsg = 'Invalid API key. Please check your API key configuration.';
            } else if (apiError.code === '104') {
              errorMsg = 'Monthly API request limit reached. Please upgrade your plan or wait for next month.';
            } else {
              errorMsg = apiError.info || errorMsg;
            }
          }
          
          throw new Error(`Failed to fetch current rates: ${errorMsg}`);
        }
      } else {
        // Original error handling
        let errorMsg = error.message || 'API call failed';
        
        if (error.response?.data?.error) {
          const apiError = error.response.data.error;
          if (apiError.code === '101') {
            errorMsg = 'Invalid API key. Please check your API key configuration.';
          } else if (apiError.code === '104') {
            errorMsg = 'Monthly API request limit reached. Please upgrade your plan or wait for next month.';
          } else {
            errorMsg = apiError.info || errorMsg;
          }
        }
        
        throw new Error(`Failed to fetch current rates: ${errorMsg}`);
      }
    }

    // Validate current rates - be more flexible
    const pairKey = `${current.source}${quote}`;
    if (!current.quotes || !current.quotes[pairKey]) {
      // Try to find any matching quote
      const availableKeys = Object.keys(current.quotes || {});
      const matchingKey = availableKeys.find(key => 
        key.includes(base) || key.includes(quote)
      );
      
      if (matchingKey && current.quotes[matchingKey]) {
        console.warn(`Using alternative quote key: ${matchingKey} instead of ${pairKey}`);
        // Use the available quote
      } else if (availableKeys.length > 0) {
        // Use first available quote as fallback
        const firstKey = availableKeys[0];
        console.warn(`Using fallback quote key: ${firstKey}`);
      } else {
        throw new Error(`Unable to fetch current rate for ${currencyPair}. The currency pair may not be supported by your API plan.`);
      }
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

    // Use available historical data (even if partial)
    // This allows signal generation with available data
    if (historical.length === 0) {
      console.warn('No historical data available. Signal will be generated with current data only.');
      // Don't throw error, proceed with current data only
    } else if (historical.length < 3) {
      console.warn(`Only ${historical.length} days of historical data available. Signal accuracy may be reduced.`);
    }

    return { current, historical };
  }
}

export const currencyLayerAPI = new CurrencyLayerAPI();

