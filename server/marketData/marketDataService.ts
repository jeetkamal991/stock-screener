import 'dotenv/config';
import type {
  HistoricalDataResult,
  MarketDataProvider,
  MarketQuote,
  SectorDataResult,
} from './types.ts';
import { TwelveDataProvider } from './providers/twelveDataProvider.ts';
import { YahooFinanceNSEProvider } from './providers/yahooProvider.ts';
import { UpstoxMarketDataProvider } from '../upstox/marketData.ts';
import { marketCache, MemoryCache } from './cache.ts';
import { marketRateLimiter, retryWithBackoff } from './rateLimiter.ts';
import { SymbolNormalizer } from './symbolNormalizer.ts';

export class MarketDataService implements MarketDataProvider {
  readonly name = 'MarketDataService';
  private upstoxProvider: UpstoxMarketDataProvider;
  private twelveDataProvider: TwelveDataProvider;
  private yahooProvider: YahooFinanceNSEProvider;

  constructor() {
    this.upstoxProvider = new UpstoxMarketDataProvider();
    this.twelveDataProvider = new TwelveDataProvider();
    this.yahooProvider = new YahooFinanceNSEProvider();
  }

  private getProviders(): { primary: MarketDataProvider; fallback: MarketDataProvider } {
    const requested = (process.env.MARKET_DATA_PROVIDER || '').toLowerCase();
    const upstoxToken = (process.env.UPSTOX_ACCESS_TOKEN || '').trim();
    const twelveKey = (process.env.MARKET_DATA_API_KEY || process.env.TWELVE_DATA_API_KEY || '').trim();

    if (requested === 'upstox' || upstoxToken.length > 0) {
      return {
        primary: this.upstoxProvider,
        fallback: this.yahooProvider,
      };
    }

    if (requested === 'twelvedata' && twelveKey.length > 0) {
      return {
        primary: this.twelveDataProvider,
        fallback: this.yahooProvider,
      };
    }

    // Default to Upstox
    return {
      primary: this.upstoxProvider,
      fallback: this.yahooProvider,
    };
  }

  isConfigured(): boolean {
    const { primary, fallback } = this.getProviders();
    return primary.isConfigured() || fallback.isConfigured();
  }

  getActiveProviderName(): string {
    const { primary, fallback } = this.getProviders();
    return primary.isConfigured() ? primary.name : fallback.name;
  }

  async getQuote(symbol: string): Promise<MarketQuote | null> {
    const { primary, fallback } = this.getProviders();
    const canonical = SymbolNormalizer.toCanonical(symbol);
    const cacheKey = `quote:${canonical}`;

    const cached = marketCache.get<MarketQuote>(cacheKey);
    if (cached) return cached;

    return marketRateLimiter.deduplicate(cacheKey, async () => {
      // 1. Try Primary Provider with retry
      try {
        const quote = await retryWithBackoff(
          () => primary.getQuote(canonical),
          { maxRetries: 1, initialDelayMs: 300 }
        );
        if (quote && quote.price > 0) {
          marketCache.set(cacheKey, quote, MemoryCache.TTL.QUOTE);
          return quote;
        }
      } catch (err: any) {
        console.warn(`[MarketDataService] Primary provider failed for quote ${canonical}: ${err.message}`);
      }

      // 2. Fall back if primary differs and primary failed
      if (primary !== fallback) {
        try {
          const fbQuote = await retryWithBackoff(
            () => fallback.getQuote(canonical),
            { maxRetries: 1, initialDelayMs: 300 }
          );
          if (fbQuote && fbQuote.price > 0) {
            marketCache.set(cacheKey, fbQuote, MemoryCache.TTL.QUOTE);
            return fbQuote;
          }
        } catch (err: any) {
          console.warn(`[MarketDataService] Fallback provider failed for quote ${canonical}: ${err.message}`);
        }
      }

      // 3. Fail explicitly: NEVER invent fake prices
      return null;
    });
  }

  async getHistoricalData(
    symbol: string,
    timeframe: 'daily' | 'weekly' = 'daily',
    range: string = '1y'
  ): Promise<HistoricalDataResult> {
    const { primary, fallback } = this.getProviders();
    const canonical = SymbolNormalizer.toCanonical(symbol);
    const cacheKey = `hist:${canonical}:${timeframe}:${range}`;

    const cached = marketCache.get<HistoricalDataResult>(cacheKey);
    if (cached) return cached;

    return marketRateLimiter.deduplicate(cacheKey, async () => {
      // 1. Try Primary Provider
      try {
        const result = await retryWithBackoff(
          () => primary.getHistoricalData(canonical, timeframe, range),
          { maxRetries: 2, initialDelayMs: 400 }
        );
        if (result && result.candles.length >= 20) {
          marketCache.set(cacheKey, result, MemoryCache.TTL.HISTORICAL);
          return result;
        }
      } catch (err: any) {
        console.warn(`[MarketDataService] Primary provider failed for hist ${canonical}: ${err.message}`);
      }

      // 2. Try Fallback Provider
      if (primary !== fallback) {
        try {
          const fbResult = await retryWithBackoff(
            () => fallback.getHistoricalData(canonical, timeframe, range),
            { maxRetries: 2, initialDelayMs: 400 }
          );
          if (fbResult && fbResult.candles.length >= 20) {
            marketCache.set(cacheKey, fbResult, MemoryCache.TTL.HISTORICAL);
            return fbResult;
          }
        } catch (err: any) {
          console.warn(`[MarketDataService] Fallback provider failed for hist ${canonical}: ${err.message}`);
        }
      }

      // Explicit failure result
      const failResult: HistoricalDataResult = {
        symbol: canonical,
        timeframe,
        candles: [],
        status: 'ERROR',
        source: this.getActiveProviderName(),
        updatedAt: new Date().toISOString(),
        error: `Unable to retrieve historical data for ${canonical} from available providers`,
      };
      return failResult;
    });
  }

  async getIntradayData(symbol: string, interval = '5min'): Promise<HistoricalDataResult> {
    const { primary, fallback } = this.getProviders();
    const canonical = SymbolNormalizer.toCanonical(symbol);
    const cacheKey = `intra:${canonical}:${interval}`;

    const cached = marketCache.get<HistoricalDataResult>(cacheKey);
    if (cached) return cached;

    return marketRateLimiter.deduplicate(cacheKey, async () => {
      try {
        const res = await primary.getIntradayData(canonical, interval);
        if (res && res.candles.length > 0) {
          marketCache.set(cacheKey, res, MemoryCache.TTL.INTRADAY);
          return res;
        }
      } catch (e: any) {
        console.warn(`[MarketDataService] Primary intraday failed for ${canonical}: ${e.message}`);
      }

      if (primary !== fallback) {
        try {
          const res = await fallback.getIntradayData(canonical, interval);
          if (res && res.candles.length > 0) {
            marketCache.set(cacheKey, res, MemoryCache.TTL.INTRADAY);
            return res;
          }
        } catch (e: any) {
          console.warn(`[MarketDataService] Fallback intraday failed for ${canonical}: ${e.message}`);
        }
      }

      return {
        symbol: canonical,
        timeframe: 'intraday',
        candles: [],
        status: 'ERROR',
        source: this.getActiveProviderName(),
        updatedAt: new Date().toISOString(),
        error: 'Intraday data unavailable',
      };
    });
  }

  async getIndexData(indexSymbol: string): Promise<{ quote: MarketQuote | null; history: HistoricalDataResult }> {
    const [quote, history] = await Promise.all([
      this.getQuote(indexSymbol),
      this.getHistoricalData(indexSymbol, 'daily', '1y'),
    ]);
    return { quote, history };
  }

  async getSectorData(): Promise<SectorDataResult[]> {
    const { primary, fallback } = this.getProviders();
    const cacheKey = 'sectors:all';
    const cached = marketCache.get<SectorDataResult[]>(cacheKey);
    if (cached) return cached;

    return marketRateLimiter.deduplicate(cacheKey, async () => {
      let results: SectorDataResult[] = [];
      try {
        results = await primary.getSectorData();
        const hasValid = results.some((r) => r.quote !== null);
        if (hasValid) {
          marketCache.set(cacheKey, results, MemoryCache.TTL.SECTOR);
          return results;
        }
      } catch (e: any) {
        console.warn(`[MarketDataService] Primary sector data failed: ${e.message}`);
      }

      if (primary !== fallback) {
        try {
          results = await fallback.getSectorData();
          marketCache.set(cacheKey, results, MemoryCache.TTL.SECTOR);
          return results;
        } catch (e: any) {
          console.warn(`[MarketDataService] Fallback sector data failed: ${e.message}`);
        }
      }

      return results;
    });
  }

  async checkHealth(): Promise<{ configured: boolean; reachable: boolean; latencyMs?: number; error?: string }> {
    const { primary, fallback } = this.getProviders();
    const primaryHealth = await primary.checkHealth();
    if (primaryHealth.reachable) {
      return primaryHealth;
    }

    if (primary !== fallback) {
      return await fallback.checkHealth();
    }

    return primaryHealth;
  }
}

export const marketDataService = new MarketDataService();
