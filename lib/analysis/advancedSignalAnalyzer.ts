import { LiveRatesResponse, HistoricalRatesResponse } from '../api/currencylayer';
import { TechnicalIndicatorCalculator, CandleData, TechnicalIndicators } from './technicalIndicators';

export interface AdvancedTradingSignal {
  signal: 'BUY' | 'SELL';
  confidence: number; // 0-100
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  trend: 'UP' | 'DOWN' | 'NEUTRAL';
  analysis: string;
  timestamp: number;
  technicalIndicators: TechnicalIndicators;
  confirmations: {
    rsi: boolean;
    macd: boolean;
    bollinger: boolean;
    ema: boolean;
    adx: boolean;
    stochastic: boolean;
    trend: boolean;
  };
  weekendDirection?: 'UP' | 'DOWN' | 'NEUTRAL';
  nextCandleTime: number; // Timestamp for next 1-minute candle
}

export class AdvancedSignalAnalyzer {
  private technicalCalculator: TechnicalIndicatorCalculator;

  constructor() {
    this.technicalCalculator = new TechnicalIndicatorCalculator();
  }

  /**
   * Advanced market analysis with multiple technical indicators
   * Target: 80% accuracy (8 out of 10 signals profitable)
   */
  analyzeMarket(
    currencyPair: string,
    current: LiveRatesResponse,
    historical: HistoricalRatesResponse[]
  ): AdvancedTradingSignal {
    const [base, quote] = currencyPair.split('/');
    const pairKey = `${current.source}${quote}`;

    // Get current price
    const currentPrice = current.quotes[pairKey] || 0;

    if (currentPrice === 0) {
      throw new Error(`Unable to get current price for ${currencyPair}`);
    }

    // Build price history with timestamps
    const prices: number[] = [];
    const timestamps: number[] = [];

    historical.forEach((day) => {
      if (day.quotes && day.quotes[pairKey]) {
        prices.push(day.quotes[pairKey]);
        timestamps.push(day.timestamp * 1000);
      }
    });
    prices.push(currentPrice);
    timestamps.push(current.timestamp * 1000);

    if (prices.length < 2) {
      throw new Error('Insufficient historical data for analysis');
    }

    // Generate 1-minute candles (simulated from available data)
    const candles = this.technicalCalculator.generateMinuteCandles(prices, timestamps);

    // Calculate all technical indicators
    const indicators = this.technicalCalculator.calculateAllIndicators(candles, prices);

    // Calculate price metrics
    const oldestPrice = prices[0] || currentPrice;
    const priceChange = currentPrice - oldestPrice;
    const priceChangePercent = oldestPrice > 0 ? (priceChange / oldestPrice) * 100 : 0;

    // Determine trend from multiple sources
    const trend = this.determineTrend(indicators, prices, priceChangePercent);

    // Get confirmations from all indicators
    const confirmations = this.getConfirmations(indicators, trend, currentPrice);

    // Count confirmations
    const confirmationCount = Object.values(confirmations).filter(Boolean).length;
    const totalConfirmations = Object.keys(confirmations).length;

    // Generate signal based on highest confidence direction
    const { signal, confidence, analysis } = this.generateSignal(
      indicators,
      trend,
      confirmations,
      confirmationCount,
      totalConfirmations,
      priceChangePercent,
      currentPrice
    );

    // Calculate next 1-minute candle time
    const now = Date.now();
    const nextCandleTime = Math.ceil(now / 60000) * 60000; // Next minute boundary

    // Weekend direction prediction
    const weekendDirection = this.predictWeekendDirection(indicators, trend, prices);

    return {
      signal,
      confidence: Math.min(100, Math.max(0, confidence)),
      currentPrice,
      priceChange,
      priceChangePercent,
      trend,
      analysis,
      timestamp: current.timestamp * 1000,
      technicalIndicators: indicators,
      confirmations,
      weekendDirection,
      nextCandleTime,
    };
  }

  /**
   * Determine trend from multiple indicators
   */
  private determineTrend(
    indicators: TechnicalIndicators,
    prices: number[],
    priceChangePercent: number
  ): 'UP' | 'DOWN' | 'NEUTRAL' {
    let upSignals = 0;
    let downSignals = 0;

    // EMA trend
    if (indicators.ema.ema9 > indicators.ema.ema21) upSignals++;
    else if (indicators.ema.ema9 < indicators.ema.ema21) downSignals++;

    if (indicators.ema.ema21 > indicators.ema.ema50) upSignals++;
    else if (indicators.ema.ema21 < indicators.ema.ema50) downSignals++;

    // SMA trend
    if (indicators.sma.sma20 > indicators.sma.sma50) upSignals++;
    else if (indicators.sma.sma20 < indicators.sma.sma50) downSignals++;

    // MACD trend
    if (indicators.macd.macd > indicators.macd.signal) upSignals++;
    else if (indicators.macd.macd < indicators.macd.signal) downSignals++;

    // Price momentum
    if (priceChangePercent > 0) upSignals++;
    else if (priceChangePercent < 0) downSignals++;

    // Bollinger position
    const currentPrice = prices[prices.length - 1];
    if (currentPrice > indicators.bollingerBands.middle) upSignals++;
    else if (currentPrice < indicators.bollingerBands.middle) downSignals++;

    if (upSignals > downSignals + 1) return 'UP';
    if (downSignals > upSignals + 1) return 'DOWN';
    return 'NEUTRAL';
  }

  /**
   * Get confirmations from all indicators
   */
  private getConfirmations(
    indicators: TechnicalIndicators,
    trend: 'UP' | 'DOWN' | 'NEUTRAL',
    currentPrice: number
  ): AdvancedTradingSignal['confirmations'] {
    // RSI confirmation
    const rsiConfirm = trend === 'UP' 
      ? indicators.rsi < 70 && indicators.rsi > 40 // Not overbought, bullish
      : indicators.rsi > 30 && indicators.rsi < 60; // Not oversold, bearish

    // MACD confirmation
    const macdConfirm = trend === 'UP'
      ? indicators.macd.macd > indicators.macd.signal && indicators.macd.histogram > 0
      : indicators.macd.macd < indicators.macd.signal && indicators.macd.histogram < 0;

    // Bollinger confirmation
    const bollingerConfirm = trend === 'UP'
      ? currentPrice > indicators.bollingerBands.middle && currentPrice < indicators.bollingerBands.upper
      : currentPrice < indicators.bollingerBands.middle && currentPrice > indicators.bollingerBands.lower;

    // EMA confirmation
    const emaConfirm = trend === 'UP'
      ? indicators.ema.ema9 > indicators.ema.ema21 && indicators.ema.ema21 > indicators.ema.ema50
      : indicators.ema.ema9 < indicators.ema.ema21 && indicators.ema.ema21 < indicators.ema.ema50;

    // ADX confirmation (trend strength > 25)
    const adxConfirm = indicators.adx > 25;

    // Stochastic confirmation
    const stochasticConfirm = trend === 'UP'
      ? indicators.stochastic.k > 50 && indicators.stochastic.k > indicators.stochastic.d
      : indicators.stochastic.k < 50 && indicators.stochastic.k < indicators.stochastic.d;

    // Trend confirmation
    const trendConfirm = trend !== 'NEUTRAL';

    return {
      rsi: rsiConfirm,
      macd: macdConfirm,
      bollinger: bollingerConfirm,
      ema: emaConfirm,
      adx: adxConfirm,
      stochastic: stochasticConfirm,
      trend: trendConfirm,
    };
  }

  /**
   * Generate signal with high accuracy (target: 80%)
   */
  private generateSignal(
    indicators: TechnicalIndicators,
    trend: 'UP' | 'DOWN' | 'NEUTRAL',
    confirmations: AdvancedTradingSignal['confirmations'],
    confirmationCount: number,
    totalConfirmations: number,
    priceChangePercent: number,
    currentPrice: number
  ): { signal: 'BUY' | 'SELL'; confidence: number; analysis: string } {
    const confirmationRatio = confirmationCount / totalConfirmations;

    // Only generate signal if we have strong confirmations (at least 4 out of 7)
    if (confirmationCount < 4) {
      // Weak signal - go with trend but lower confidence
      const signal = trend === 'UP' ? 'BUY' : trend === 'DOWN' ? 'SELL' : 'BUY';
      const confidence = 40 + (confirmationCount * 5);
      return {
        signal,
        confidence,
        analysis: `Weak signal. Only ${confirmationCount}/${totalConfirmations} confirmations. ${this.getIndicatorSummary(indicators, confirmations)}`,
      };
    }

    // Strong signal - require multiple confirmations
    let signal: 'BUY' | 'SELL';
    let confidence = 50;

    // Base confidence from confirmations
    confidence += confirmationCount * 8; // Each confirmation adds 8%

    // RSI strength
    if (indicators.rsi < 30) {
      confidence += 10; // Oversold - strong BUY
      signal = 'BUY';
    } else if (indicators.rsi > 70) {
      confidence += 10; // Overbought - strong SELL
      signal = 'SELL';
    } else {
      // Use trend and other indicators
      signal = trend === 'UP' ? 'BUY' : trend === 'DOWN' ? 'SELL' : 'BUY';
    }

    // MACD strength
    if (indicators.macd.histogram > 0 && signal === 'BUY') confidence += 5;
    if (indicators.macd.histogram < 0 && signal === 'SELL') confidence += 5;

    // ADX strength (trend strength)
    if (indicators.adx > 40) confidence += 8;
    else if (indicators.adx > 25) confidence += 4;

    // Bollinger position
    if (signal === 'BUY' && currentPrice < indicators.bollingerBands.lower) {
      confidence += 7; // Price near lower band - potential bounce
    } else if (signal === 'SELL' && currentPrice > indicators.bollingerBands.upper) {
      confidence += 7; // Price near upper band - potential reversal
    }

    // Ensure confidence is realistic (max 95% for safety)
    confidence = Math.min(95, Math.max(60, confidence));

    const analysis = this.generateDetailedAnalysis(
      indicators,
      trend,
      confirmations,
      confirmationCount,
      signal,
      confidence
    );

    return { signal, confidence, analysis };
  }

  /**
   * Generate detailed analysis text
   */
  private generateDetailedAnalysis(
    indicators: TechnicalIndicators,
    trend: 'UP' | 'DOWN' | 'NEUTRAL',
    confirmations: AdvancedTradingSignal['confirmations'],
    confirmationCount: number,
    signal: 'BUY' | 'SELL',
    confidence: number
  ): string {
    const parts: string[] = [];

    parts.push(`Strong ${signal} signal with ${confirmationCount}/7 confirmations.`);

    if (indicators.rsi < 30) {
      parts.push('RSI indicates oversold condition (strong BUY opportunity).');
    } else if (indicators.rsi > 70) {
      parts.push('RSI indicates overbought condition (strong SELL opportunity).');
    } else {
      parts.push(`RSI at ${indicators.rsi.toFixed(1)} (neutral zone).`);
    }

    if (indicators.macd.histogram > 0) {
      parts.push('MACD shows bullish momentum.');
    } else {
      parts.push('MACD shows bearish momentum.');
    }

    if (indicators.adx > 40) {
      parts.push('Strong trend detected (ADX > 40).');
    } else if (indicators.adx > 25) {
      parts.push('Moderate trend strength (ADX > 25).');
    }

    if (confirmations.ema) {
      parts.push('EMA alignment confirms trend direction.');
    }

    if (confirmations.bollinger) {
      parts.push('Price position within Bollinger Bands supports signal.');
    }

    parts.push(`Confidence: ${confidence.toFixed(0)}% based on technical analysis.`);

    return parts.join(' ');
  }

  /**
   * Get indicator summary
   */
  private getIndicatorSummary(
    indicators: TechnicalIndicators,
    confirmations: AdvancedTradingSignal['confirmations']
  ): string {
    const active: string[] = [];
    if (confirmations.rsi) active.push('RSI');
    if (confirmations.macd) active.push('MACD');
    if (confirmations.ema) active.push('EMA');
    if (confirmations.bollinger) active.push('Bollinger');
    if (confirmations.adx) active.push('ADX');
    if (confirmations.stochastic) active.push('Stochastic');

    return `Active indicators: ${active.join(', ') || 'None'}`;
  }

  /**
   * Predict weekend direction based on current analysis
   */
  private predictWeekendDirection(
    indicators: TechnicalIndicators,
    trend: 'UP' | 'DOWN' | 'NEUTRAL',
    prices: number[]
  ): 'UP' | 'DOWN' | 'NEUTRAL' {
    // Analyze momentum and trend strength
    const momentum = prices[prices.length - 1] - prices[Math.max(0, prices.length - 5)];
    const strongTrend = indicators.adx > 30;

    if (trend === 'UP' && momentum > 0 && strongTrend) {
      return 'UP';
    } else if (trend === 'DOWN' && momentum < 0 && strongTrend) {
      return 'DOWN';
    }

    return 'NEUTRAL';
  }
}

export const advancedSignalAnalyzer = new AdvancedSignalAnalyzer();


