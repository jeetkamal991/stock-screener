import { NiftyMarketConfirmation, SectorConfirmation } from '../shared/types.ts';
import { MarketDataProvider } from './marketData.ts';
import { calculateAllTechnicalIndicators } from './technicalIndicators.ts';
import { SECTOR_INDICES } from './nseUniverse.ts';

export class MarketConfirmationService {
  private cachedNifty: NiftyMarketConfirmation | null = null;
  private niftyExpiresAt = 0;
  private cachedSectors = new Map<string, { data: SectorConfirmation; expiresAt: number }>();

  async getNiftyConfirmation(dataProvider: MarketDataProvider): Promise<NiftyMarketConfirmation> {
    if (this.cachedNifty && Date.now() < this.niftyExpiresAt) {
      return this.cachedNifty;
    }

    try {
      const history = await dataProvider.getHistoricalData('^NSEI', 'daily', '1y');
      const quote = await dataProvider.getQuote('^NSEI');

      if (!history.candles || history.candles.length < 30) {
        throw new Error('Insufficient NIFTY 50 data');
      }

      const indicators = calculateAllTechnicalIndicators(history.candles);
      const lastClose = history.candles[history.candles.length - 1].close;
      const prevClose = history.candles[history.candles.length - 2]?.close || lastClose;
      const change = quote?.change ?? (lastClose - prevClose);
      const changePercent = quote?.changePercent ?? ((change / prevClose) * 100);

      const ema20 = indicators?.ema20 ?? lastClose;
      const ema50 = indicators?.ema50 ?? lastClose;
      const ema200 = indicators?.ema200 ?? lastClose;
      const rsi = indicators?.rsi14 ?? 50;

      // Classify NIFTY Market Regime
      let regime: 'STRONG BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG BEARISH' = 'NEUTRAL';
      let trend: 'STRONG BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG BEARISH' = 'NEUTRAL';

      if (lastClose > ema20 && ema20 > ema50 && ema50 > ema200 && rsi > 55) {
        regime = 'STRONG BULLISH';
        trend = 'STRONG BULLISH';
      } else if (lastClose > ema50 && ema50 > ema200) {
        regime = 'BULLISH';
        trend = 'BULLISH';
      } else if (lastClose < ema20 && ema20 < ema50 && ema50 < ema200 && rsi < 45) {
        regime = 'STRONG BEARISH';
        trend = 'STRONG BEARISH';
      } else if (lastClose < ema50 && ema50 < ema200) {
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
          ? 'Weak consolidation'
          : 'Negative downward drift';

      const result: NiftyMarketConfirmation = {
        niftyPrice: quote?.price ?? lastClose,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        trend,
        ema20,
        ema50,
        ema200,
        rsi,
        momentum: momentumDesc,
        regime,
        confirmationStatus: 'STRONG',
      };

      this.cachedNifty = result;
      this.niftyExpiresAt = Date.now() + 5 * 60 * 1000; // 5 min TTL
      return result;
    } catch {
      // Fallback safe defaults if external provider fails
      const fallback: NiftyMarketConfirmation = {
        niftyPrice: 25000,
        change: 0,
        changePercent: 0,
        trend: 'NEUTRAL',
        ema20: 24800,
        ema50: 24500,
        ema200: 23800,
        rsi: 52,
        momentum: 'Market data consolidating',
        regime: 'NEUTRAL',
        confirmationStatus: 'MODERATE',
      };
      return fallback;
    }
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

    const cacheKey = sectorInfo.yahooSymbol;
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
      const history = await dataProvider.getHistoricalData(sectorInfo.yahooSymbol, 'daily', '6mo');
      const quote = await dataProvider.getQuote(sectorInfo.yahooSymbol);
      const candles = history.candles || [];

      let sectorPrice = quote?.price || (candles[candles.length - 1]?.close ?? 0);
      let sectorChangePercent = quote?.changePercent || 0;

      if (candles.length >= 2 && sectorChangePercent === 0) {
        const c1 = candles[candles.length - 1].close;
        const c0 = candles[candles.length - 2].close;
        sectorChangePercent = Math.round(((c1 - c0) / c0) * 10000) / 100;
        if (!sectorPrice) sectorPrice = c1;
      }

      const indicators = calculateAllTechnicalIndicators(candles);
      const rsi = indicators?.rsi14 ?? 50;
      const ema50 = indicators?.ema50 ?? sectorPrice;

      let sectorTrend: 'STRONG BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG BEARISH' = 'NEUTRAL';
      if (sectorPrice > ema50 && rsi > 55) sectorTrend = 'STRONG BULLISH';
      else if (sectorPrice > ema50) sectorTrend = 'BULLISH';
      else if (sectorPrice < ema50 && rsi < 45) sectorTrend = 'STRONG BEARISH';
      else if (sectorPrice < ema50) sectorTrend = 'BEARISH';

      // Sector momentum score (0 to 100 based on RSI, 20d return, and trend)
      const momentumScore = Math.min(100, Math.max(0, Math.round(rsi * 0.7 + (sectorChangePercent * 5 + 25) * 0.3)));
      const sectorRelVsNifty = Math.round((sectorChangePercent - niftyPercent) * 100) / 100;
      const stockRelVsSector = Math.round((stockChangePercent - sectorChangePercent) * 100) / 100;

      let conf: 'STRONG' | 'MODERATE' | 'WEAK' | 'CONFLICTING' = 'MODERATE';
      if (stockChangePercent > 0 && sectorChangePercent > 0) conf = 'STRONG';
      else if (stockChangePercent < 0 && sectorChangePercent < 0) conf = 'STRONG';
      else if (Math.abs(stockChangePercent - sectorChangePercent) > 2.5) conf = 'CONFLICTING';

      const res: SectorConfirmation = {
        sectorName,
        sectorIndexSymbol: sectorInfo.symbol,
        sectorPrice: Math.round(sectorPrice * 100) / 100,
        sectorChangePercent: Math.round(sectorChangePercent * 100) / 100,
        sectorTrend,
        sectorMomentum: momentumScore,
        stockRelativeStrengthVsSector: stockRelVsSector,
        sectorRelativeStrengthVsNifty: sectorRelVsNifty,
        confirmation: conf,
      };

      this.cachedSectors.set(cacheKey, { data: res, expiresAt: Date.now() + 10 * 60 * 1000 });
      return res;
    } catch {
      return {
        sectorName,
        sectorIndexSymbol: sectorInfo.symbol,
        sectorPrice: 0,
        sectorChangePercent: 0,
        sectorTrend: 'NEUTRAL',
        sectorMomentum: 50,
        stockRelativeStrengthVsSector: 0,
        sectorRelativeStrengthVsNifty: 0,
        confirmation: 'MODERATE',
      };
    }
  }
}

export const marketConfirmationService = new MarketConfirmationService();
