import { BaseMarketDataProvider } from '../marketData/providers/baseProvider.ts';
import type {
  HistoricalDataResult,
  MarketQuote,
  SectorDataResult,
} from '../marketData/types.ts';
import { upstoxClient, UpstoxClient } from './client.ts';
import { upstoxInstruments, UpstoxInstrumentService } from './instruments.ts';
import { SECTOR_INDICES } from '../nseUniverse.ts';
import { formatISTDateTime, getMarketStatus } from '../marketData/marketHours.ts';
import { calculateAllTechnicalIndicators } from '../technicalIndicators.ts';

export class UpstoxMarketDataProvider extends BaseMarketDataProvider {
  readonly name = 'Upstox';
  private client: UpstoxClient;
  private instruments: UpstoxInstrumentService;
  private sectorCache: { data: SectorDataResult[]; expiresAt: number } | null = null;

  constructor(client: UpstoxClient = upstoxClient, instruments: UpstoxInstrumentService = upstoxInstruments) {
    super();
    this.client = client;
    this.instruments = instruments;
  }

  isConfigured(): boolean {
    return this.client.isConfigured();
  }

  /**
   * Fetches a real-time quote for an NSE stock or index
   */
  async getQuote(symbol: string): Promise<MarketQuote | null> {
    if (!this.isConfigured() || !symbol) {
      return null;
    }

    const key = (await this.instruments.resolveKey(symbol)) || this.instruments.cleanSymbol(symbol);
    if (!key) return null;

    try {
      const quotesMap = await this.client.getQuotes([key]);
      const quote = quotesMap.get(key) || quotesMap.get(symbol.toUpperCase());
      if (!quote || typeof quote.last_price !== 'number' || quote.last_price <= 0) {
        return null;
      }

      const price = quote.last_price;
      const change = typeof quote.net_change === 'number' ? quote.net_change : 0;
      // Previous close calculation
      const previousClose =
        typeof quote.prev_close_price === 'number' && quote.prev_close_price > 0
          ? quote.prev_close_price
          : price - change;

      // Mathematical percentage change calculation: (current - previousClose) / previousClose * 100
      const changePercent =
        previousClose > 0
          ? Math.round(((change / previousClose) * 100) * 100) / 100
          : 0;

      const dayHigh = quote.ohlc?.high && quote.ohlc.high > 0 ? quote.ohlc.high : price;
      const dayLow = quote.ohlc?.low && quote.ohlc.low > 0 ? quote.ohlc.low : price;
      const fiftyTwoWeekHigh = quote.year_high && quote.year_high > 0 ? quote.year_high : dayHigh;
      const fiftyTwoWeekLow = quote.year_low && quote.year_low > 0 ? quote.year_low : dayLow;
      const volume = quote.volume || quote.ohlc?.volume || 0;

      const timestamp = quote.last_trade_time
        ? parseInt(quote.last_trade_time, 10)
        : Date.now();

      const marketStatus = getMarketStatus(timestamp);
      const canonicalSymbol = this.instruments.cleanSymbol(symbol);

      return {
        symbol: canonicalSymbol,
        price: Math.round(price * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent,
        volume,
        dayHigh: Math.round(dayHigh * 100) / 100,
        dayLow: Math.round(dayLow * 100) / 100,
        fiftyTwoWeekHigh: Math.round(fiftyTwoWeekHigh * 100) / 100,
        fiftyTwoWeekLow: Math.round(fiftyTwoWeekLow * 100) / 100,
        previousClose: Math.round(previousClose * 100) / 100,
        timestamp,
        updatedAt: formatISTDateTime(timestamp),
        source: this.name,
        isDelayed: false,
        marketStatus: marketStatus.marketStatus,
      };
    } catch (err: any) {
      console.warn(`[UpstoxMarketDataProvider] getQuote failed for ${symbol}: ${err.message}`);
      return null;
    }
  }

  /**
   * Fetches historical daily or weekly candle bars for an NSE stock or index
   */
  async getHistoricalData(
    symbol: string,
    timeframe: 'daily' | 'weekly' = 'daily',
    range: string = '1y'
  ): Promise<HistoricalDataResult> {
    const canonical = this.instruments.cleanSymbol(symbol);

    if (!this.isConfigured()) {
      return {
        symbol: canonical,
        timeframe,
        candles: [],
        status: 'ERROR',
        source: this.name,
        updatedAt: formatISTDateTime(),
        error: 'Upstox market data provider is not configured with UPSTOX_ACCESS_TOKEN',
      };
    }

    const key = await this.instruments.resolveKey(symbol);
    if (!key) {
      return {
        symbol: canonical,
        timeframe,
        candles: [],
        status: 'ERROR',
        source: this.name,
        updatedAt: formatISTDateTime(),
        error: `Could not resolve Upstox instrument key for symbol ${symbol}`,
      };
    }

    const interval = timeframe === 'weekly' ? 'week' : 'day';
    const now = new Date();
    const toDate = now.toISOString().split('T')[0];

    // Compute past date: fetch at least 450-500 days for daily to reliably cover 200 EMA
    let daysToFetch = 450;
    if (range === '2y') daysToFetch = 800;
    else if (range === '5y') daysToFetch = 1900;
    else if (range === '6m') daysToFetch = 220;
    else if (range === '3m') daysToFetch = 120;
    else if (range === '1m') daysToFetch = 40;

    if (timeframe === 'weekly') {
      daysToFetch = Math.max(daysToFetch, 1000); // 3 years of weekly data
    }

    const fromTime = now.getTime() - daysToFetch * 24 * 60 * 60 * 1000;
    const fromDate = new Date(fromTime).toISOString().split('T')[0];

    try {
      const candles = await this.client.getHistoricalCandles(key, interval, toDate, fromDate);

      if (candles.length === 0) {
        return {
          symbol: canonical,
          timeframe,
          candles: [],
          status: 'INSUFFICIENT',
          source: this.name,
          updatedAt: formatISTDateTime(),
          error: `No candle data returned from Upstox for ${symbol} (${key})`,
        };
      }

      return {
        symbol: canonical,
        timeframe,
        candles,
        status: candles.length < 30 ? 'INSUFFICIENT' : 'FRESH',
        source: this.name,
        updatedAt: formatISTDateTime(),
        rawCount: candles.length,
      };
    } catch (err: any) {
      return {
        symbol: canonical,
        timeframe,
        candles: [],
        status: 'ERROR',
        source: this.name,
        updatedAt: formatISTDateTime(),
        error: err.message || `Failed to fetch historical candles for ${symbol}`,
      };
    }
  }

  /**
   * Fetches intraday candles for an NSE stock or index
   */
  async getIntradayData(symbol: string, interval = '30minute'): Promise<HistoricalDataResult> {
    const canonical = this.instruments.cleanSymbol(symbol);

    if (!this.isConfigured()) {
      return {
        symbol: canonical,
        timeframe: 'intraday',
        candles: [],
        status: 'ERROR',
        source: this.name,
        updatedAt: formatISTDateTime(),
        error: 'Upstox is not configured',
      };
    }

    const key = await this.instruments.resolveKey(symbol);
    if (!key) {
      return {
        symbol: canonical,
        timeframe: 'intraday',
        candles: [],
        status: 'ERROR',
        source: this.name,
        updatedAt: formatISTDateTime(),
        error: `Could not resolve Upstox instrument key for ${symbol}`,
      };
    }

    try {
      const candles = await this.client.getIntradayCandles(key, interval);
      return {
        symbol: canonical,
        timeframe: 'intraday',
        candles,
        status: candles.length > 0 ? 'FRESH' : 'INSUFFICIENT',
        source: this.name,
        updatedAt: formatISTDateTime(),
        rawCount: candles.length,
      };
    } catch (err: any) {
      return {
        symbol: canonical,
        timeframe: 'intraday',
        candles: [],
        status: 'ERROR',
        source: this.name,
        updatedAt: formatISTDateTime(),
        error: err.message,
      };
    }
  }

  /**
   * Fetches quote and historical daily candles for a benchmark or sector index
   */
  async getIndexData(indexSymbol: string): Promise<{ quote: MarketQuote | null; history: HistoricalDataResult }> {
    const [quote, history] = await Promise.all([
      this.getQuote(indexSymbol),
      this.getHistoricalData(indexSymbol, 'daily', '1y'),
    ]);
    return { quote, history };
  }

  /**
   * Fetches sector overview and momentum ranking for all NSE sectors
   */
  async getSectorData(): Promise<SectorDataResult[]> {
    // 3-minute in-memory cache to prevent excessive requests
    if (this.sectorCache && Date.now() < this.sectorCache.expiresAt) {
      return this.sectorCache.data;
    }

    const sectorEntries = Object.entries(SECTOR_INDICES);

    // Map each sector to its Upstox instrument key
    const sectorKeyMap = new Map<string, string>();
    for (const [, info] of sectorEntries) {
      const key = this.instruments.getKeySync(info.symbol) || this.instruments.getKeySync(info.name);
      if (key) {
        sectorKeyMap.set(info.symbol, key);
      }
    }

    const uniqueKeys = Array.from(new Set(Array.from(sectorKeyMap.values())));
    const quotesMap = await this.client.getQuotes(uniqueKeys);

    const results: SectorDataResult[] = [];

    // Fetch historical data for unique sector keys with small concurrency
    const historyCache = new Map<string, HistoricalDataResult>();
    for (const key of uniqueKeys) {
      try {
        const hist = await this.getHistoricalData(key, 'daily', '6m');
        historyCache.set(key, hist);
      } catch {
        // continue
      }
    }

    for (const [sector, info] of sectorEntries) {
      const instrumentKey = sectorKeyMap.get(info.symbol);
      const quoteItem = instrumentKey ? quotesMap.get(instrumentKey) : null;
      const history = instrumentKey ? historyCache.get(instrumentKey) : null;
      const candles = history?.candles || [];

      if (!quoteItem && candles.length < 2) {
        results.push({
          sector,
          name: info.name,
          symbol: info.symbol,
          status: 'UNAVAILABLE',
          quote: null,
          error: 'No market quote or candle data available',
        });
        continue;
      }

      const lastCandle = candles[candles.length - 1];
      const prevCandle = candles.length >= 2 ? candles[candles.length - 2] : lastCandle;

      const price = quoteItem?.last_price ?? lastCandle?.close ?? 0;
      const change = quoteItem?.net_change ?? (lastCandle && prevCandle ? (lastCandle.close - prevCandle.close) : 0);
      const previousClose =
        quoteItem?.prev_close_price && quoteItem.prev_close_price > 0
          ? quoteItem.prev_close_price
          : prevCandle?.close ?? (price - change);

      const changePercent =
        previousClose > 0
          ? Math.round(((change / previousClose) * 100) * 100) / 100
          : 0;

      // Calculate 20D Return
      let return20D: number | undefined;
      if (candles.length >= 21) {
        const close20DaysAgo = candles[candles.length - 21].close;
        if (close20DaysAgo > 0) {
          return20D = Math.round((((price - close20DaysAgo) / close20DaysAgo) * 100) * 100) / 100;
        }
      }

      // Calculate Indicators & Momentum Score
      const indicators = candles.length >= 20 ? calculateAllTechnicalIndicators(candles) : null;
      const rsi14 = indicators?.rsi14;
      const ema50 = indicators?.ema50;

      let momentumScore: number | undefined;
      if (rsi14 !== undefined && return20D !== undefined) {
        const rsiPart = Math.max(0, Math.min(35, rsi14 * 0.35));
        const retPart = Math.max(0, Math.min(35, 17.5 + (return20D * 1.75)));
        const pctAboveEma = ema50 && ema50 > 0 ? ((price - ema50) / ema50) * 100 : 0;
        const emaPart = Math.max(0, Math.min(30, 15 + (pctAboveEma * 2.5)));
        momentumScore = Math.max(0, Math.min(100, Math.round(rsiPart + retPart + emaPart)));
      }

      const quote: MarketQuote = {
        symbol: info.symbol,
        price: Math.round(price * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent,
        volume: quoteItem?.volume || lastCandle?.volume || 0,
        dayHigh: quoteItem?.ohlc?.high ?? lastCandle?.high ?? price,
        dayLow: quoteItem?.ohlc?.low ?? lastCandle?.low ?? price,
        fiftyTwoWeekHigh: quoteItem?.year_high ?? lastCandle?.high ?? price,
        fiftyTwoWeekLow: quoteItem?.year_low ?? lastCandle?.low ?? price,
        previousClose: Math.round(previousClose * 100) / 100,
        timestamp: quoteItem?.last_trade_time ? parseInt(quoteItem.last_trade_time, 10) : Date.now(),
        updatedAt: formatISTDateTime(),
        source: this.name,
      };

      results.push({
        sector,
        name: info.name,
        symbol: info.symbol,
        status: 'OK',
        quote,
        price: Math.round(price * 100) / 100,
        changePercent,
        return20D,
        rsi14: rsi14 ? Math.round(rsi14 * 10) / 10 : undefined,
        ema50: ema50 ? Math.round(ema50 * 100) / 100 : undefined,
        momentumScore,
      });
    }

    this.sectorCache = {
      data: results,
      expiresAt: Date.now() + 3 * 60 * 1000, // 3-minute cache
    };

    return results;
  }

  async checkHealth(): Promise<{ configured: boolean; reachable: boolean; latencyMs?: number; error?: string }> {
    return this.client.checkHealth();
  }
}

export const upstoxMarketDataProvider = new UpstoxMarketDataProvider();
