/**
 * Advanced Technical Indicators for Professional Trading Analysis
 */

export interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  timestamp: number;
}

export interface TechnicalIndicators {
  rsi: number; // Relative Strength Index (0-100)
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  ema: {
    ema9: number;
    ema21: number;
    ema50: number;
  };
  sma: {
    sma20: number;
    sma50: number;
  };
  adx: number; // Average Directional Index
  stochastic: {
    k: number;
    d: number;
  };
}

export class TechnicalIndicatorCalculator {
  /**
   * Calculate RSI (Relative Strength Index)
   * RSI > 70 = Overbought (SELL signal)
   * RSI < 30 = Oversold (BUY signal)
   */
  calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;

    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains.push(change);
        losses.push(0);
      } else {
        gains.push(0);
        losses.push(Math.abs(change));
      }
    }

    const recentGains = gains.slice(-period);
    const recentLosses = losses.slice(-period);

    const avgGain = recentGains.reduce((a, b) => a + b, 0) / period;
    const avgLoss = recentLosses.reduce((a, b) => a + b, 0) / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return Math.max(0, Math.min(100, rsi));
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   */
  calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    if (prices.length < 26) {
      return { macd: 0, signal: 0, histogram: 0 };
    }

    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 - ema26;

    // Signal line (9-period EMA of MACD)
    const macdValues: number[] = [];
    for (let i = 0; i < prices.length; i++) {
      const ema12_val = this.calculateEMA(prices.slice(0, i + 1), 12);
      const ema26_val = this.calculateEMA(prices.slice(0, i + 1), 26);
      macdValues.push(ema12_val - ema26_val);
    }
    const signal = this.calculateEMA(macdValues, 9);
    const histogram = macd - signal;

    return { macd, signal, histogram };
  }

  /**
   * Calculate Bollinger Bands
   */
  calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): {
    upper: number;
    middle: number;
    lower: number;
  } {
    if (prices.length < period) {
      const sma = this.calculateSMA(prices, prices.length);
      return { upper: sma, middle: sma, lower: sma };
    }

    const sma = this.calculateSMA(prices, period);
    const recentPrices = prices.slice(-period);

    // Calculate standard deviation
    const mean = sma;
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);

    return {
      upper: sma + (standardDeviation * stdDev),
      middle: sma,
      lower: sma - (standardDeviation * stdDev),
    };
  }

  /**
   * Calculate EMA (Exponential Moving Average)
   */
  calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0;
    if (prices.length < period) {
      return this.calculateSMA(prices, prices.length);
    }

    const multiplier = 2 / (period + 1);
    const recentPrices = prices.slice(-period);
    
    // Start with SMA
    let ema = this.calculateSMA(recentPrices, period);

    // Calculate EMA for remaining values
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }

    return ema;
  }

  /**
   * Calculate SMA (Simple Moving Average)
   */
  calculateSMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0;
    const relevantPrices = prices.slice(-period);
    const sum = relevantPrices.reduce((a, b) => a + b, 0);
    return sum / relevantPrices.length;
  }

  /**
   * Calculate ADX (Average Directional Index)
   */
  calculateADX(candles: CandleData[], period: number = 14): number {
    if (candles.length < period + 1) return 25;

    const trValues: number[] = [];
    const plusDM: number[] = [];
    const minusDM: number[] = [];

    for (let i = 1; i < candles.length; i++) {
      const highDiff = candles[i].high - candles[i - 1].high;
      const lowDiff = candles[i - 1].low - candles[i].low;

      const tr = Math.max(
        candles[i].high - candles[i].low,
        Math.abs(candles[i].high - candles[i - 1].close),
        Math.abs(candles[i].low - candles[i - 1].close)
      );

      trValues.push(tr);
      plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
      minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);
    }

    const recentTR = trValues.slice(-period);
    const recentPlusDM = plusDM.slice(-period);
    const recentMinusDM = minusDM.slice(-period);

    const avgTR = recentTR.reduce((a, b) => a + b, 0) / period;
    const avgPlusDM = recentPlusDM.reduce((a, b) => a + b, 0) / period;
    const avgMinusDM = recentMinusDM.reduce((a, b) => a + b, 0) / period;

    if (avgTR === 0) return 25;

    const plusDI = (avgPlusDM / avgTR) * 100;
    const minusDI = (avgMinusDM / avgTR) * 100;
    const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;

    return Math.max(0, Math.min(100, dx));
  }

  /**
   * Calculate Stochastic Oscillator
   */
  calculateStochastic(candles: CandleData[], period: number = 14): { k: number; d: number } {
    if (candles.length < period) {
      return { k: 50, d: 50 };
    }

    const recentCandles = candles.slice(-period);
    const highestHigh = Math.max(...recentCandles.map(c => c.high));
    const lowestLow = Math.min(...recentCandles.map(c => c.low));
    const currentClose = candles[candles.length - 1].close;

    if (highestHigh === lowestLow) {
      return { k: 50, d: 50 };
    }

    const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;

    // Calculate %D (3-period SMA of %K)
    const kValues: number[] = [];
    for (let i = period - 1; i < candles.length; i++) {
      const periodCandles = candles.slice(i - period + 1, i + 1);
      const hh = Math.max(...periodCandles.map(c => c.high));
      const ll = Math.min(...periodCandles.map(c => c.low));
      const cc = candles[i].close;
      if (hh !== ll) {
        kValues.push(((cc - ll) / (hh - ll)) * 100);
      }
    }

    const d = kValues.length > 0 
      ? kValues.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, kValues.length)
      : k;

    return { k: Math.max(0, Math.min(100, k)), d: Math.max(0, Math.min(100, d)) };
  }

  /**
   * Generate 1-minute candle data from price history
   */
  generateMinuteCandles(prices: number[], timestamps: number[]): CandleData[] {
    const candles: CandleData[] = [];
    
    // Simulate minute candles from available data
    // Group prices into 1-minute intervals
    const minuteInterval = 60000; // 1 minute in milliseconds
    
    for (let i = 0; i < prices.length; i++) {
      const price = prices[i];
      const timestamp = timestamps[i] || Date.now() - (prices.length - i) * minuteInterval;
      
      // For simulation, use price as open, high, low, close
      // In real scenario, you'd have actual OHLC data
      candles.push({
        open: price,
        high: price * 1.001, // Simulate slight variation
        low: price * 0.999,
        close: price,
        timestamp,
      });
    }

    return candles;
  }

  /**
   * Calculate all technical indicators
   */
  calculateAllIndicators(candles: CandleData[], prices: number[]): TechnicalIndicators {
    const closes = candles.map(c => c.close);
    
    return {
      rsi: this.calculateRSI(closes),
      macd: this.calculateMACD(closes),
      bollingerBands: this.calculateBollingerBands(closes),
      ema: {
        ema9: this.calculateEMA(closes, 9),
        ema21: this.calculateEMA(closes, 21),
        ema50: this.calculateEMA(closes, 50),
      },
      sma: {
        sma20: this.calculateSMA(closes, 20),
        sma50: this.calculateSMA(closes, 50),
      },
      adx: this.calculateADX(candles),
      stochastic: this.calculateStochastic(candles),
    };
  }
}

export const technicalCalculator = new TechnicalIndicatorCalculator();


