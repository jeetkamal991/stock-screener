import { BaseMarketDataProvider } from './baseProvider.ts';
import type {
  HistoricalDataResult,
  MarketQuote,
  SectorDataResult,
} from '../types.ts';
import { SymbolNormalizer } from '../symbolNormalizer.ts';
import type { OHLCV } from '../../../shared/types.ts';
import { SECTOR_INDICES } from '../../nseUniverse.ts';
import { formatISTDateTime, getMarketStatus } from '../marketHours.ts';

export class TwelveDataProvider extends BaseMarketDataProvider {
  readonly name = 'TwelveData';
  private apiKey: string;
  private baseUrl = 'https://api.twelvedata.com';

  constructor(apiKey?: string) {
    super();
    this.apiKey = apiKey || process.env.MARKET_DATA_API_KEY || process.env.TWELVE_DATA_API_KEY || '';
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async getQuote(symbol: string): Promise<MarketQuote | null> {
    if (!this.isConfigured()) return null;

    const mapping = SymbolNormalizer.getMapping(symbol);
    const querySymbol = mapping.twelveDataSymbol;
    const url = `${this.baseUrl}/quote?symbol=${encodeURIComponent(querySymbol)}&apikey=${this.apiKey}`;

    try {
      const { response } = await this.fetchWithTimeout(url, {}, 8000, {
        symbol,
        action: 'getQuote',
      });
      if (!response.ok) return null;

      const data = await response.json();
      if (data.code || data.status === 'error' || !data.close) {
        return null;
      }

      const price = parseFloat(data.close) || 0;
      const previousClose = parseFloat(data.previous_close) || price;
      const change = parseFloat(data.change) || (price - previousClose);
      const changePercent = parseFloat(data.percent_change) || (previousClose !== 0 ? (change / previousClose) * 100 : 0);

      const dayHigh = parseFloat(data.high) || price;
      const dayLow = parseFloat(data.low) || price;
      const fiftyTwoWeekHigh = parseFloat(data.fifty_two_week?.high) || dayHigh;
      const fiftyTwoWeekLow = parseFloat(data.fifty_two_week?.low) || dayLow;
      const volume = parseInt(data.volume, 10) || 0;
      const timestamp = data.timestamp ? data.timestamp * 1000 : Date.now();

      const marketInfo = getMarketStatus(timestamp);

      return {
        symbol: mapping.canonical,
        price: Math.round(price * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        volume,
        dayHigh: Math.round(dayHigh * 100) / 100,
        dayLow: Math.round(dayLow * 100) / 100,
        fiftyTwoWeekHigh: Math.round(fiftyTwoWeekHigh * 100) / 100,
        fiftyTwoWeekLow: Math.round(fiftyTwoWeekLow * 100) / 100,
        previousClose: Math.round(previousClose * 100) / 100,
        timestamp,
        updatedAt: formatISTDateTime(timestamp),
        source: this.name,
        isDelayed: marketInfo.isDelayed,
        marketStatus: marketInfo.marketStatus,
      };
    } catch (e) {
      return null;
    }
  }

  async getHistoricalData(
    symbol: string,
    timeframe: 'daily' | 'weekly' = 'daily',
    range: string = '1y'
  ): Promise<HistoricalDataResult> {
    if (!this.isConfigured()) {
      return {
        symbol: SymbolNormalizer.toCanonical(symbol),
        timeframe,
        candles: [],
        status: 'ERROR',
        source: this.name,
        updatedAt: formatISTDateTime(),
        error: 'TwelveData provider is not configured with MARKET_DATA_API_KEY',
      };
    }

    const mapping = SymbolNormalizer.getMapping(symbol);
    const querySymbol = mapping.twelveDataSymbol;
    const interval = timeframe === 'weekly' ? '1week' : '1day';
    const outputsize = range === '2y' ? '500' : '260';

    const url = `${this.baseUrl}/time_series?symbol=${encodeURIComponent(querySymbol)}&interval=${interval}&outputsize=${outputsize}&apikey=${this.apiKey}`;

    try {
      const { response } = await this.fetchWithTimeout(url, {}, 10000, {
        symbol,
        action: 'getHistoricalData',
      });
      if (!response.ok) {
        return {
          symbol: mapping.canonical,
          timeframe,
          candles: [],
          status: 'ERROR',
          source: this.name,
          updatedAt: formatISTDateTime(),
          error: `TwelveData HTTP error: ${response.status}`,
        };
      }

      const data = await response.json();
      if (!data.values || !Array.isArray(data.values) || data.values.length === 0) {
        return {
          symbol: mapping.canonical,
          timeframe,
          candles: [],
          status: 'ERROR',
          source: this.name,
          updatedAt: formatISTDateTime(),
          error: data.message || 'No historical candle values returned',
        };
      }

      // TwelveData returns descending (newest first). Convert to chronological ascending.
      const candles: OHLCV[] = data.values
        .map((v: any) => {
          const timestamp = new Date(v.datetime).getTime();
          const open = parseFloat(v.open);
          const high = parseFloat(v.high);
          const low = parseFloat(v.low);
          const close = parseFloat(v.close);
          const volume = parseInt(v.volume, 10) || 0;

          if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) return null;

          return {
            timestamp,
            open,
            high,
            low,
            close,
            volume,
            dateStr: v.datetime,
          };
        })
        .filter((c: any): c is OHLCV => c !== null)
        .reverse();

      return {
        symbol: mapping.canonical,
        timeframe,
        candles,
        status: candles.length < 50 ? 'INSUFFICIENT' : 'FRESH',
        source: this.name,
        updatedAt: formatISTDateTime(),
        rawCount: candles.length,
      };
    } catch (err: any) {
      return {
        symbol: mapping.canonical,
        timeframe,
        candles: [],
        status: 'ERROR',
        source: this.name,
        updatedAt: formatISTDateTime(),
        error: err.message,
      };
    }
  }

  async getIntradayData(symbol: string, interval = '5min'): Promise<HistoricalDataResult> {
    if (!this.isConfigured()) {
      return {
        symbol: SymbolNormalizer.toCanonical(symbol),
        timeframe: 'intraday',
        candles: [],
        status: 'ERROR',
        source: this.name,
        updatedAt: formatISTDateTime(),
        error: 'TwelveData provider not configured',
      };
    }

    const mapping = SymbolNormalizer.getMapping(symbol);
    const url = `${this.baseUrl}/time_series?symbol=${encodeURIComponent(mapping.twelveDataSymbol)}&interval=${interval}&outputsize=75&apikey=${this.apiKey}`;

    try {
      const { response } = await this.fetchWithTimeout(url, {}, 8000, { symbol, action: 'getIntraday' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data.values) throw new Error('No values');

      const candles: OHLCV[] = data.values
        .map((v: any) => ({
          timestamp: new Date(v.datetime).getTime(),
          open: parseFloat(v.open),
          high: parseFloat(v.high),
          low: parseFloat(v.low),
          close: parseFloat(v.close),
          volume: parseInt(v.volume, 10) || 0,
          dateStr: v.datetime,
        }))
        .reverse();

      return {
        symbol: mapping.canonical,
        timeframe: 'intraday',
        candles,
        status: 'FRESH',
        source: this.name,
        updatedAt: formatISTDateTime(),
      };
    } catch (e: any) {
      return {
        symbol: mapping.canonical,
        timeframe: 'intraday',
        candles: [],
        status: 'ERROR',
        source: this.name,
        updatedAt: formatISTDateTime(),
        error: e.message,
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

  async getSectorData(): Promise<SectorDataResult[]> {
    const results: SectorDataResult[] = [];
    for (const [sector, info] of Object.entries(SECTOR_INDICES)) {
      const quote = await this.getQuote(info.symbol);
      results.push({
        sector,
        name: info.name,
        symbol: info.symbol,
        status: quote ? 'OK' : 'UNAVAILABLE',
        quote,
      });
    }
    return results;
  }

  async checkHealth(): Promise<{ configured: boolean; reachable: boolean; latencyMs?: number; error?: string }> {
    if (!this.isConfigured()) {
      return { configured: false, reachable: false, error: 'MARKET_DATA_API_KEY is not set' };
    }

    try {
      const start = Date.now();
      const url = `${this.baseUrl}/quote?symbol=RELIANCE:NSE&apikey=${this.apiKey}`;
      const { response, durationMs } = await this.fetchWithTimeout(url, {}, 5000, { action: 'healthCheck' });
      return {
        configured: true,
        reachable: response.ok,
        latencyMs: durationMs,
      };
    } catch (e: any) {
      return {
        configured: true,
        reachable: false,
        error: e.message,
      };
    }
  }
}
