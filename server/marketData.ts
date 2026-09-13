import { OHLCV } from '../shared/types.ts';
import { SECTOR_INDICES } from './nseUniverse.ts';

export interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  dayHigh: number;
  dayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  previousClose: number;
  timestamp: number;
  updatedAt: string;
  source: string;
}

export interface HistoricalDataResult {
  symbol: string;
  timeframe: 'daily' | 'weekly' | 'intraday';
  candles: OHLCV[];
  status: 'FRESH' | 'STALE' | 'INSUFFICIENT' | 'ERROR';
  source: string;
  updatedAt: string;
  error?: string;
}

export interface MarketDataProvider {
  getQuote(symbol: string): Promise<MarketQuote | null>;
  getHistoricalData(symbol: string, timeframe: 'daily' | 'weekly', range?: string): Promise<HistoricalDataResult>;
  getIntradayData(symbol: string, interval?: string): Promise<HistoricalDataResult>;
  getIndexData(indexSymbol: string): Promise<{ quote: MarketQuote | null; history: HistoricalDataResult }>;
  getSectorData(): Promise<Array<{ sector: string; name: string; symbol: string; quote: MarketQuote | null }>>;
}

// Memory cache entry
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class YahooFinanceNSEProvider implements MarketDataProvider {
  private cache = new Map<string, CacheEntry<any>>();
  private inFlightRequests = new Map<string, Promise<any>>();
  private quoteTTL = 3 * 60 * 1000;      // 3 minutes
  private historyTTL = 15 * 60 * 1000;   // 15 minutes

  private formatSymbol(symbol: string): string {
    const s = symbol.trim().toUpperCase();
    if (s.startsWith('^')) return s;
    if (s.endsWith('.NS') || s.endsWith('.BO')) return s;
    return `${s}.NS`;
  }

  private cleanSymbol(yahooSymbol: string): string {
    return yahooSymbol.replace('.NS', '').replace('^', '');
  }

  private async fetchWithRetry(url: string, retries = 2): Promise<any> {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
    };

    let lastError: any;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, { headers, signal: controller.signal });
        clearTimeout(timeout);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        const json = await res.json();
        return json;
      } catch (err) {
        lastError = err;
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
        }
      }
    }
    throw lastError;
  }

  async getHistoricalData(
    rawSymbol: string,
    timeframe: 'daily' | 'weekly' = 'daily',
    range: string = '1y'
  ): Promise<HistoricalDataResult> {
    const formatted = this.formatSymbol(rawSymbol);
    const interval = timeframe === 'weekly' ? '1wk' : '1d';
    const cacheKey = `history:${formatted}:${interval}:${range}`;

    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    if (this.inFlightRequests.has(cacheKey)) {
      return this.inFlightRequests.get(cacheKey);
    }

    const promise = (async (): Promise<HistoricalDataResult> => {
      try {
        const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(formatted)}?interval=${interval}&range=${range}`;
        const data = await this.fetchWithRetry(url);

        const result = data?.chart?.result?.[0];
        if (!result) {
          return {
            symbol: rawSymbol,
            timeframe,
            candles: [],
            status: 'ERROR',
            source: 'NSE (Yahoo Finance)',
            updatedAt: new Date().toISOString(),
            error: 'No chart result returned from exchange',
          };
        }

        const timestamps: number[] = result.timestamp || [];
        const quoteObj = result.indicators?.quote?.[0] || {};
        const opens: number[] = quoteObj.open || [];
        const highs: number[] = quoteObj.high || [];
        const lows: number[] = quoteObj.low || [];
        const closes: number[] = quoteObj.close || [];
        const volumes: number[] = quoteObj.volume || [];

        const candles: OHLCV[] = [];
        const seenTimestamps = new Set<number>();

        for (let i = 0; i < timestamps.length; i++) {
          const ts = timestamps[i];
          const o = opens[i];
          const h = highs[i];
          const l = lows[i];
          const c = closes[i];
          const v = volumes[i] ?? 0;

          // Strict candle validation
          if (ts == null || o == null || h == null || l == null || c == null) continue;
          if (isNaN(o) || isNaN(h) || isNaN(l) || isNaN(c)) continue;
          if (o <= 0 || h <= 0 || l <= 0 || c <= 0) continue;
          if (h < l || h < Math.max(o, c) || l > Math.min(o, c)) continue;
          if (seenTimestamps.has(ts)) continue;

          seenTimestamps.add(ts);
          candles.push({
            timestamp: ts * 1000,
            open: Math.round(o * 100) / 100,
            high: Math.round(h * 100) / 100,
            low: Math.round(l * 100) / 100,
            close: Math.round(c * 100) / 100,
            volume: Math.round(v),
            dateStr: new Date(ts * 1000).toISOString().split('T')[0],
          });
        }

        // Sort ascending chronologically
        candles.sort((a, b) => a.timestamp - b.timestamp);

        let status: 'FRESH' | 'STALE' | 'INSUFFICIENT' | 'ERROR' = 'FRESH';
        if (candles.length < 50) {
          status = 'INSUFFICIENT';
        }

        const res: HistoricalDataResult = {
          symbol: rawSymbol,
          timeframe,
          candles,
          status,
          source: 'NSE (Live via Yahoo Finance)',
          updatedAt: new Date().toISOString(),
        };

        this.cache.set(cacheKey, { data: res, expiresAt: Date.now() + this.historyTTL });
        return res;
      } catch (err: any) {
        return {
          symbol: rawSymbol,
          timeframe,
          candles: [],
          status: 'ERROR',
          source: 'NSE (Yahoo Finance)',
          updatedAt: new Date().toISOString(),
          error: err?.message || 'Failed to fetch historical data',
        };
      } finally {
        this.inFlightRequests.delete(cacheKey);
      }
    })();

    this.inFlightRequests.set(cacheKey, promise);
    return promise;
  }

  async getQuote(rawSymbol: string): Promise<MarketQuote | null> {
    const formatted = this.formatSymbol(rawSymbol);
    const cacheKey = `quote:${formatted}`;

    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    try {
      const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(formatted)}?interval=1d&range=5d`;
      const data = await this.fetchWithRetry(url);
      const res = data?.chart?.result?.[0];
      if (!res) return null;

      const meta = res.meta;
      const lastPrice = meta.regularMarketPrice ?? meta.previousClose ?? 0;
      const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? lastPrice;
      const change = Math.round((lastPrice - prevClose) * 100) / 100;
      const changePercent = prevClose ? Math.round((change / prevClose) * 10000) / 100 : 0;

      const quote: MarketQuote = {
        symbol: rawSymbol,
        price: lastPrice,
        change,
        changePercent: meta.regularMarketChangePercent ?? changePercent,
        volume: meta.regularMarketVolume ?? 0,
        dayHigh: meta.regularMarketDayHigh ?? lastPrice,
        dayLow: meta.regularMarketDayLow ?? lastPrice,
        fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? lastPrice,
        fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? lastPrice,
        previousClose: prevClose,
        timestamp: (meta.regularMarketTime || Math.floor(Date.now() / 1000)) * 1000,
        updatedAt: new Date().toISOString(),
        source: 'NSE (Live)',
      };

      this.cache.set(cacheKey, { data: quote, expiresAt: Date.now() + this.quoteTTL });
      return quote;
    } catch {
      return null;
    }
  }

  async getIntradayData(rawSymbol: string, interval: string = '5m'): Promise<HistoricalDataResult> {
    const formatted = this.formatSymbol(rawSymbol);
    const cacheKey = `intraday:${formatted}:${interval}`;

    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    try {
      const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(formatted)}?interval=${interval}&range=1d`;
      const data = await this.fetchWithRetry(url);
      const result = data?.chart?.result?.[0];
      if (!result) throw new Error('No intraday result');

      const timestamps: number[] = result.timestamp || [];
      const quoteObj = result.indicators?.quote?.[0] || {};
      const candles: OHLCV[] = [];

      for (let i = 0; i < timestamps.length; i++) {
        const ts = timestamps[i];
        const c = quoteObj.close?.[i];
        if (ts == null || c == null || isNaN(c)) continue;
        candles.push({
          timestamp: ts * 1000,
          open: quoteObj.open?.[i] ?? c,
          high: quoteObj.high?.[i] ?? c,
          low: quoteObj.low?.[i] ?? c,
          close: c,
          volume: quoteObj.volume?.[i] ?? 0,
          dateStr: new Date(ts * 1000).toISOString(),
        });
      }

      const res: HistoricalDataResult = {
        symbol: rawSymbol,
        timeframe: 'intraday',
        candles,
        status: candles.length ? 'FRESH' : 'INSUFFICIENT',
        source: 'NSE (Intraday Live)',
        updatedAt: new Date().toISOString(),
      };

      this.cache.set(cacheKey, { data: res, expiresAt: Date.now() + 60 * 1000 });
      return res;
    } catch (err: any) {
      return {
        symbol: rawSymbol,
        timeframe: 'intraday',
        candles: [],
        status: 'ERROR',
        source: 'NSE',
        updatedAt: new Date().toISOString(),
        error: err?.message,
      };
    }
  }

  async getIndexData(indexSymbol: string): Promise<{ quote: MarketQuote | null; history: HistoricalDataResult }> {
    const [quote, history] = await Promise.all([
      this.getQuote(indexSymbol),
      this.getHistoricalData(indexSymbol, 'daily', '1y'),
    ]);
    return { quote, history };
  }

  async getSectorData(): Promise<Array<{ sector: string; name: string; symbol: string; quote: MarketQuote | null }>> {
    const sectors = Object.entries(SECTOR_INDICES);
    const results = await Promise.all(
      sectors.map(async ([sectorName, info]) => {
        const quote = await this.getQuote(info.yahooSymbol);
        return {
          sector: sectorName,
          name: info.name,
          symbol: info.symbol,
          quote,
        };
      })
    );
    return results;
  }
}

// Singleton instance
export const marketDataProvider: MarketDataProvider = new YahooFinanceNSEProvider();
