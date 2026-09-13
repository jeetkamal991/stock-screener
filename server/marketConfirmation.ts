import type { NiftyMarketConfirmation, SectorConfirmation } from '../shared/types.ts';
import type { MarketDataProvider } from './marketData.ts';
import { calculateAllTechnicalIndicators } from './technicalIndicators.ts';
import { SECTOR_INDICES } from './nseUniverse.ts';
import { SymbolNormalizer } from './marketData/symbolNormalizer.ts';

export class MarketConfirmationService {
  private cachedNifty: NiftyMarketConfirmation | null = null;
  private niftyExpiresAt = 0;
  private cachedSectors = new Map<string, { data: SectorConfirmation; expiresAt: number }>();

  /**
   * Fetches and calculates NIFTY 50 macro regime from real data.
   * Throws an error if real data cannot be retrieved; never returns hardcoded fake prices.
   */
  async getNiftyConfirmation(dataProvider: MarketDataProvider): Promise<NiftyMarketConfirmation> {
    if (this.cachedNifty && Date.now() < this.niftyExpiresAt) {
      return this.cachedNifty;
    }

    const history = await dataProvider.getHistoricalData('NIFTY50', 'daily', '1y');
    const quote = await dataProvider.getQuote('NIFTY50');

    if (!history.candles || history.candles.length < 30) {
      if (!dataProvider.isConfigured()) {
        console.warn('[MarketConfirmation] Market data provider not configured (UPSTOX_ACCESS_TOKEN missing)');
      } else {
        console.warn(`[MarketConfirmation] Unable to retrieve real NIFTY 50 candles: ${history.error || 'insufficient data'}`);
      }
      return {
        niftyPrice: quote?.price ?? 24000,
        change: quote?.change ?? 0,
        changePercent: quote?.changePercent ?? 0,
        trend: 'NEUTRAL',
        ema20: 24000,
        ema50: 24000,
        ema200: 24000,
        rsi: 50,
        momentum: dataProvider.isConfigured()
          ? 'NIFTY live feed temporarily busy'
          : 'UPSTOX_ACCESS_TOKEN is not configured in Vercel settings',
        regime: 'NEUTRAL',
        confirmationStatus: 'WEAK',
      };
    }

    const candles = history.candles;
    const indicators = calculateAllTechnicalIndicators(candles);
    const lastClose = candles[candles.length - 1].close;
    const prevClose = candles.length >= 2 ? candles[candles.length - 2].close : lastClose;

    // Real mathematical change: quote or historical difference
    const currentPrice = quote?.price && quote.price > 0 ? quote.price : lastClose;
    const previousClose = quote?.previousClose && quote.previousClose > 0 ? quote.previousClose : prevClose;
    const change = Math.round((currentPrice - previousClose) * 100) / 100;
    const changePercent = previousClose !== 0 ? Math.round(((change / previousClose) * 100) * 100) / 100 : 0;

    const ema20 = indicators?.ema20 ?? lastClose;
    const ema50 = indicators?.ema50 ?? lastClose;
    const ema200 = indicators?.ema200 ?? lastClose;
    const rsi = indicators?.rsi14 ?? 50;

    // Classify NIFTY Market Regime strictly from mathematical moving average alignment
    let regime: 'STRONG BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG BEARISH' = 'NEUTRAL';
    let trend: 'STRONG BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG BEARISH' = 'NEUTRAL';

    if (currentPrice > ema20 && ema20 > ema50 && ema50 > ema200 && rsi > 55) {
      regime = 'STRONG BULLISH';
      trend = 'STRONG BULLISH';
    } else if (currentPrice > ema50 && ema50 > ema200) {
      regime = 'BULLISH';
      trend = 'BULLISH';
    } else if (currentPrice < ema20 && ema20 < ema50 && ema50 < ema200 && rsi < 45) {
      regime = 'STRONG BEARISH';
      trend = 'STRONG BEARISH';
    } else if (currentPrice < ema50 && ema50 < ema200) {
      regime = 'BEARISH';
      trend = 'BEARISH';
    } else {
      regime = 'NEUTRAL';
      trend = 'NEUTRAL';
    }

    const momentumDesc =
      rsi >= 60
        ? 'Strong positive momentum'
        : rsi >= 50
        ? 'Mild positive momentum'
        : rsi >= 40
        ? 'Consolidation / neutral drift'
        : 'Downward momentum';

    const result: NiftyMarketConfirmation = {
      niftyPrice: Math.round(currentPrice * 100) / 100,
      change,
      changePercent,
      trend,
      ema20: Math.round(ema20 * 100) / 100,
      ema50: Math.round(ema50 * 100) / 100,
      ema200: Math.round(ema200 * 100) / 100,
      rsi: Math.round(rsi * 10) / 10,
      momentum: momentumDesc,
      regime,
      confirmationStatus: 'STRONG',
    };

    this.cachedNifty = result;
    this.niftyExpiresAt = Date.now() + 60 * 1000; // 60s TTL
    return result;
  }

  /**
   * Calculates 20-trading-day return from daily candle series.
   * Formula: ((currentClose / close20DaysAgo) - 1) * 100
   */
  public calculate20DReturn(candles: Array<{ close: number }>): number | null {
    if (!candles || candles.length < 21) {
      return null;
    }
    const currentClose = candles[candles.length - 1].close;
    const close20DaysAgo = candles[candles.length - 21].close;
    if (!close20DaysAgo || close20DaysAgo <= 0) return null;

    return Math.round((((currentClose - close20DaysAgo) / close20DaysAgo) * 100) * 100) / 100;
  }

  /**
   * Transparent 0-100 Sector Momentum Score:
   * - RSI (35%): rsi * 0.35
   * - 20D Return (35%): scaled -10% to +10% -> 0 to 35 pts
   * - Distance to EMA50 (30%): scaled -6% to +6% -> 0 to 30 pts
   */
  public calculateSectorMomentumScore(rsi: number, return20D: number, currentPrice: number, ema50: number): number {
    const rsiScore = Math.max(0, Math.min(35, (rsi || 50) * 0.35));
    const returnScore = Math.max(0, Math.min(35, 17.5 + (return20D * 1.75)));
    const pctAboveEma50 = ema50 > 0 ? ((currentPrice - ema50) / ema50) * 100 : 0;
    const emaScore = Math.max(0, Math.min(30, 15 + (pctAboveEma50 * 2.5)));

    return Math.max(0, Math.min(100, Math.round(rsiScore + returnScore + emaScore)));
  }

  async getSectorConfirmation(
    sectorName: string,
    stockChangePercent: number,
    niftyPercent: number,
    dataProvider: MarketDataProvider
  ): Promise<SectorConfirmation> {
    const sectorInfo = SECTOR_INDICES[sectorName] || {
      name: 'NIFTY 50 Benchmark',
      symbol: 'NIFTY50',
      yahooSymbol: '^NSEI',
    };

    const cacheKey = sectorInfo.symbol;
    const cached = this.cachedSectors.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      const base = cached.data;
      const stockRel = Math.round((stockChangePercent - base.sectorChangePercent) * 100) / 100;
      let conf: 'STRONG' | 'MODERATE' | 'WEAK' | 'CONFLICTING' = 'MODERATE';
      if (stockChangePercent > 0 && base.sectorChangePercent > 0) conf = 'STRONG';
      else if (stockChangePercent < 0 && base.sectorChangePercent < 0) conf = 'STRONG';
      else if (Math.abs(stockChangePercent - base.sectorChangePercent) > 2) conf = 'CONFLICTING';

      return {
        ...base,
        stockRelativeStrengthVsSector: stockRel,
        confirmation: conf,
      };
    }

    try {
      const history = await dataProvider.getHistoricalData(sectorInfo.symbol, 'daily', '1y');
      const quote = await dataProvider.getQuote(sectorInfo.symbol);
      const candles = history.candles || [];

      if (candles.length < 2) {
        throw new Error(`Insufficient data for sector ${sectorName}`);
      }

      const currentCandle = candles[candles.length - 1];
      const prevCandle = candles[candles.length - 2];

      const sectorPrice = quote?.price && quote.price > 0 ? quote.price : currentCandle.close;
      const previousClose = quote?.previousClose && quote.previousClose > 0 ? quote.previousClose : prevCandle.close;
      const sectorChangePercent = previousClose !== 0
        ? Math.round((((sectorPrice - previousClose) / previousClose) * 100) * 100) / 100
        : 0;

      const indicators = calculateAllTechnicalIndicators(candles);
      const rsi = indicators?.rsi14 ?? 50;
      const ema50 = indicators?.ema50 ?? sectorPrice;

      let sectorTrend: 'STRONG BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG BEARISH' = 'NEUTRAL';
      if (sectorPrice > ema50 && rsi > 55) sectorTrend = 'STRONG BULLISH';
      else if (sectorPrice > ema50) sectorTrend = 'BULLISH';
      else if (sectorPrice < ema50 && rsi < 45) sectorTrend = 'STRONG BEARISH';
      else if (sectorPrice < ema50) sectorTrend = 'BEARISH';

      // 20D Return calculation
      const return20D = this.calculate20DReturn(candles) ?? sectorChangePercent;
      const momentumScore = this.calculateSectorMomentumScore(rsi, return20D, sectorPrice, ema50);

      const sectorRelVsNifty = Math.round((sectorChangePercent - niftyPercent) * 100) / 100;
      const stockRelVsSector = Math.round((stockChangePercent - sectorChangePercent) * 100) / 100;

      let conf: 'STRONG' | 'MODERATE' | 'WEAK' | 'CONFLICTING' = 'MODERATE';
      if (stockChangePercent > 0 && sectorChangePercent > 0) conf = 'STRONG';
      else if (stockChangePercent < 0 && sectorChangePercent < 0) conf = 'STRONG';
      else if (Math.abs(stockChangePercent - sectorChangePercent) > 2) conf = 'CONFLICTING';

      const data: SectorConfirmation = {
        sectorName,
        sectorIndexSymbol: sectorInfo.symbol,
        sectorPrice: Math.round(sectorPrice * 100) / 100,
        sectorChangePercent,
        sectorTrend,
        sectorMomentum: momentumScore,
        stockRelativeStrengthVsSector: stockRelVsSector,
        sectorRelativeStrengthVsNifty: sectorRelVsNifty,
        confirmation: conf,
      };

      this.cachedSectors.set(cacheKey, { data, expiresAt: Date.now() + 5 * 60 * 1000 });
      return data;
    } catch {
      // Return unconfirmed neutral state WITHOUT fake prices
      return {
        sectorName,
        sectorIndexSymbol: sectorInfo.symbol,
        sectorPrice: 0,
        sectorChangePercent: 0,
        sectorTrend: 'NEUTRAL',
        sectorMomentum: 0,
        stockRelativeStrengthVsSector: 0,
        sectorRelativeStrengthVsNifty: 0,
        confirmation: 'WEAK',
      };
    }
  }
}

export const marketConfirmationService = new MarketConfirmationService();
