import { CurrencyRate, LiveRatesResponse, HistoricalRatesResponse } from '../api/currencylayer';

export interface TradingSignal {
  signal: 'BUY' | 'SELL';
  confidence: number; // 0-100
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  trend: 'UP' | 'DOWN' | 'NEUTRAL';
  analysis: string;
  timestamp: number;
}

export class SignalAnalyzer {
  /**
   * Analyze market data and generate trading signal
   */
  analyzeMarket(
    currencyPair: string,
    current: LiveRatesResponse,
    historical: HistoricalRatesResponse[]
  ): TradingSignal {
    const [base, quote] = currencyPair.split('/');
    
    // CurrencyLayer returns quotes in format "SOURCE+CURRENCY"
    // Since we use base as source and request quote, the key is BASE+QUOTE
    const pairKey = `${current.source}${quote}`;

    // Get current price
    const currentPrice = current.quotes[pairKey] || 0;

    if (currentPrice === 0) {
      throw new Error(`Unable to get current price for ${currencyPair}. Invalid quote key: ${pairKey}`);
    }

    // Calculate price history
    const prices: number[] = [];
    historical.forEach((day) => {
      if (day.quotes && day.quotes[pairKey]) {
        prices.push(day.quotes[pairKey]);
      }
    });
    prices.push(currentPrice);

    // Ensure we have enough data points
    if (prices.length < 2) {
      throw new Error('Insufficient historical data for analysis. Need at least 2 data points.');
    }

    // Calculate moving averages
    const sma7 = this.calculateSMA(prices, 7);
    const sma3 = this.calculateSMA(prices.slice(-3), 3);

    // Calculate price change
    const oldestPrice = prices[0] || currentPrice;
    const priceChange = currentPrice - oldestPrice;
    const priceChangePercent = oldestPrice > 0 ? (priceChange / oldestPrice) * 100 : 0;

    // Determine trend
    let trend: 'UP' | 'DOWN' | 'NEUTRAL' = 'NEUTRAL';
    if (sma3 > sma7) {
      trend = 'UP';
    } else if (sma3 < sma7) {
      trend = 'DOWN';
    }

    // Calculate momentum
    const momentum = this.calculateMomentum(prices);
    const volatility = this.calculateVolatility(prices);

    // Generate signal and confidence
    let signal: 'BUY' | 'SELL';
    let confidence: number;
    let analysis: string;

    if (trend === 'UP' && momentum > 0 && priceChangePercent > 0) {
      signal = 'BUY';
      confidence = this.calculateConfidence(trend, momentum, volatility, priceChangePercent, true);
      analysis = `Strong upward trend detected. Price increased by ${priceChangePercent.toFixed(2)}%. Momentum is positive. Short-term MA (${sma3.toFixed(4)}) is above long-term MA (${sma7.toFixed(4)}).`;
    } else if (trend === 'DOWN' && momentum < 0 && priceChangePercent < 0) {
      signal = 'SELL';
      confidence = this.calculateConfidence(trend, momentum, volatility, priceChangePercent, false);
      analysis = `Strong downward trend detected. Price decreased by ${Math.abs(priceChangePercent).toFixed(2)}%. Momentum is negative. Short-term MA (${sma3.toFixed(4)}) is below long-term MA (${sma7.toFixed(4)}).`;
    } else if (trend === 'UP') {
      signal = 'BUY';
      confidence = this.calculateConfidence(trend, momentum, volatility, priceChangePercent, true);
      analysis = `Moderate upward trend. Price change: ${priceChangePercent.toFixed(2)}%. Consider buying with caution.`;
    } else {
      signal = 'SELL';
      confidence = this.calculateConfidence(trend, momentum, volatility, priceChangePercent, false);
      analysis = `Moderate downward trend. Price change: ${priceChangePercent.toFixed(2)}%. Consider selling with caution.`;
    }

    return {
      signal,
      confidence: Math.min(100, Math.max(0, confidence)),
      currentPrice,
      priceChange,
      priceChangePercent,
      trend,
      analysis,
      timestamp: current.timestamp * 1000,
    };
  }

  private calculateSMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0;
    const relevantPrices = prices.slice(-period);
    const sum = relevantPrices.reduce((a, b) => a + b, 0);
    return sum / relevantPrices.length;
  }

  private calculateMomentum(prices: number[]): number {
    if (prices.length < 2) return 0;
    const recent = prices.slice(-3);
    const older = prices.slice(-6, -3);
    if (older.length === 0) return 0;
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    return ((recentAvg - olderAvg) / olderAvg) * 100;
  }

  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      if (prices[i - 1] > 0) {
        returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
      }
    }
    if (returns.length === 0) return 0;
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance) * 100;
  }

  private calculateConfidence(
    trend: 'UP' | 'DOWN' | 'NEUTRAL',
    momentum: number,
    volatility: number,
    priceChangePercent: number,
    isBuy: boolean
  ): number {
    let confidence = 50; // Base confidence

    // Trend strength (0-20 points)
    if (trend !== 'NEUTRAL') {
      confidence += 15;
    }

    // Momentum strength (0-20 points)
    const momentumStrength = Math.min(20, Math.abs(momentum) * 2);
    confidence += momentumStrength;

    // Price change strength (0-20 points)
    const priceChangeStrength = Math.min(20, Math.abs(priceChangePercent) * 2);
    confidence += priceChangeStrength;

    // Volatility penalty (0-10 points reduction)
    const volatilityPenalty = Math.min(10, volatility * 5);
    confidence -= volatilityPenalty;

    // Ensure confidence is within bounds
    return Math.max(30, Math.min(95, confidence));
  }
}

export const signalAnalyzer = new SignalAnalyzer();

