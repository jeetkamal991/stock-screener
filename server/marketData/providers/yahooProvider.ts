import { BaseMarketDataProvider } from './baseProvider.ts';
import {
  HistoricalDataResult,
  MarketQuote,
  SectorDataResult,
} from '../types.ts';
import { SymbolNormalizer } from '../symbolNormalizer.ts';
import { OHLCV } from '../../../shared/types.ts';
import { SECTOR_INDICES } from '../../nseUniverse.ts';
import { formatISTDateTime, getMarketStatus } from '../marketHours.ts';

export class YahooFinanceNSEProvider extends BaseMarketDataProvider {
  readonly name = 'YahooFinanceNSE';

  isConfigured(): boolean {
    return true; // Yahoo public API requires no key
  }

  private getHeaders(): Record<string, string> {
    return {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
    };
  }

  async getQuote(symbol: string): Promise<MarketQuote | null> {
    const mapping = SymbolNormalizer.getMapping(symbol);
    const yahooSym = mapping.yahooSymbol;

    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSym)}?interval=1d&range=5d`;

    try {
      const { response } = await this.fetchWithTimeout(
        url,
        { headers: this.getHeaders() },
        8000,
        { symbol: mapping.canonical, action: 'getQuote' }
      );

      if (!response.ok) {
        return null;
      }

      const json = await response.json();
      const result = json?.chart?.result?.[0];
      if (!result) return null;

      const meta = result.meta;
      const quote = result.indicators?.quote?.[0];
      const timestamps = result.timestamp || [];

      if (!meta) return null;

      // Current Price: prioritize regularMarketPrice, fallback to last valid close
      let price = meta.regularMarketPrice;
      if (typeof price !== 'number' || isNaN(price)) {
        const closes = (quote?.close || []).filter((c: any) => typeof c === 'number' && !isNaN(c));
        price = closes.length > 0 ? closes[closes.length - 1] : 0;
      }

      if (price <= 0) return null;

      // Previous Close: prioritize chartPreviousClose or previousClose
      let previousClose = meta.chartPreviousClose ?? meta.previousClose;
      if (typeof previousClose !== 'number' || isNaN(previousClose) || previousClose === 0) {
        const validCloses = (quote?.close || []).filter((c: any) => typeof c === 'number' && !isNaN(c));
        if (validCloses.length >= 2) {
          previousClose = validCloses[validCloses.length - 2];
        } else {
          previousClose = price;
        }
      }

      // Exact mathematical calculation of change and changePercent
      const change = price - previousClose;
      const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

      const dayHigh = typeof meta.regularMarketDayHigh === 'number' ? meta.regularMarketDayHigh : price;
      const dayLow = typeof meta.regularMarketDayLow === 'number' ? meta.regularMarketDayLow : price;
      const fiftyTwoWeekHigh = typeof meta.fiftyTwoWeekHigh === 'number' ? meta.fiftyTwoWeekHigh : dayHigh;
      const fiftyTwoWeekLow = typeof meta.fiftyTwoWeekLow === 'number' ? meta.fiftyTwoWeekLow : dayLow;
      const volume = typeof meta.regularMarketVolume === 'number' ? meta.regularMarketVolume : (quote?.volume?.[quote.volume.length - 1] || 0);

      const timestamp = (meta.regularMarketTime || timestamps[timestamps.length - 1] || Math.floor(Date.now() / 1000)) * 1000;
      const marketInfo = getMarketStatus(timestamp);

      return {
        symbol: mapping.canonical,
        price: Math.round(price * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        volume: volume || 0,
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
    } catch (e: any) {
      return null;
    }
  }

  async getHistoricalData(
    symbol: string,
    timeframe: 'daily' | 'weekly' = 'daily',
    range: string = '1y'
  ): Promise<HistoricalDataResult> {
    const mapping = SymbolNormalizer.getMapping(symbol);
    const yahooSym = mapping.yahooSymbol;

    const interval = timeframe === 'weekly' ? '1wk' : '1d';
    const queryRange = range || (timeframe === 'weekly' ? '2y' : '1y');

    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSym)}?interval=${interval}&range=${queryRange}`;

    try {
      const { response } = await this.fetchWithTimeout(
        url,
        { headers: this.getHeaders() },
        9000,
        { symbol: mapping.canonical, action: 'getHistoricalData' }
      );

      if (!response.ok) {
        return {
          symbol: mapping.canonical,
          timeframe,
          candles: [],
          status: 'ERROR',
          source: this.name,
          updatedAt: formatISTDateTime(),
          error: `HTTP ${response.status} from Yahoo Finance for ${mapping.canonical}`,
        };
      }

      const json = await response.json();
      const result = json?.chart?.result?.[0];
      if (!result) {
        return {
          symbol: mapping.canonical,
          timeframe,
          candles: [],
          status: 'ERROR',
          source: this.name,
          updatedAt: formatISTDateTime(),
          error: json?.chart?.error?.description || 'No candle chart data found in Yahoo response',
        };
      }

      const timestamps: number[] = result.timestamp || [];
      const quote = result.indicators?.quote?.[0];
      const adjclose = result.indicators?.adjclose?.[0]?.adjclose;

      if (!quote || timestamps.length === 0) {
        return {
          symbol: mapping.canonical,
          timeframe,
          candles: [],
          status: 'INSUFFICIENT',
          source: this.name,
          updatedAt: formatISTDateTime(),
          error: 'Empty timestamps or quotes returned',
        };
      }

      const candles: OHLCV[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        const rawClose = adjclose?.[i] ?? quote.close?.[i];
        const rawOpen = quote.open?.[i];
        const rawHigh = quote.high?.[i];
        const rawLow = quote.low?.[i];
        const rawVol = quote.volume?.[i];

        // Strict validation: omit null or invalid candles
        if (
          typeof rawClose !== 'number' || isNaN(rawClose) ||
          typeof rawOpen !== 'number' || isNaN(rawOpen) ||
          typeof rawHigh !== 'number' || isNaN(rawHigh) ||
          typeof rawLow !== 'number' || isNaN(rawLow)
        ) {
          continue;
        }

        const date = new Date(timestamps[i] * 1000);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');

        candles.push({
          timestamp: timestamps[i] * 1000,
          open: Math.round(rawOpen * 100) / 100,
          high: Math.round(rawHigh * 100) / 100,
          low: Math.round(rawLow * 100) / 100,
          close: Math.round(rawClose * 100) / 100,
          volume: Math.round(rawVol || 0),
          dateStr: `${yyyy}-${mm}-${dd}`,
        });
      }

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

  async getIntradayData(symbol: string, interval: string = '5m'): Promise<HistoricalDataResult> {
    const mapping = SymbolNormalizer.getMapping(symbol);
    const yahooSym = mapping.yahooSymbol;
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSym)}?interval=${interval}&range=1d`;

    try {
      const { response } = await this.fetchWithTimeout(
        url,
        { headers: this.getHeaders() },
        8000,
        { symbol: mapping.canonical, action: 'getIntraday' }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      const result = json?.chart?.result?.[0];
      if (!result) throw new Error('No chart data');

      const timestamps: number[] = result.timestamp || [];
      const quote = result.indicators?.quote?.[0];
      const candles: OHLCV[] = [];

      for (let i = 0; i < timestamps.length; i++) {
        const c = quote.close?.[i];
        const o = quote.open?.[i];
        const h = quote.high?.[i];
        const l = quote.low?.[i];
        const v = quote.volume?.[i];

        if (typeof c === 'number' && !isNaN(c) && typeof o === 'number') {
          candles.push({
            timestamp: timestamps[i] * 1000,
            open: Math.round(o * 100) / 100,
            high: Math.round((h || o) * 100) / 100,
            low: Math.round((l || o) * 100) / 100,
            close: Math.round(c * 100) / 100,
            volume: Math.round(v || 0),
            dateStr: new Date(timestamps[i] * 1000).toISOString(),
          });
        }
      }

      return {
        symbol: mapping.canonical,
        timeframe: 'intraday',
        candles,
        status: candles.length === 0 ? 'INSUFFICIENT' : 'FRESH',
        source: this.name,
        updatedAt: formatISTDateTime(),
      };
    } catch (err: any) {
      return {
        symbol: mapping.canonical,
        timeframe: 'intraday',
        candles: [],
        status: 'ERROR',
        source: this.name,
        updatedAt: formatISTDateTime(),
        error: err.message,
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
      try {
        const [quote, history] = await Promise.all([
          this.getQuote(info.yahooSymbol),
          this.getHistoricalData(info.yahooSymbol, 'daily', '3mo'),
        ]);

        const candles = history.candles || [];
        const hasData = quote !== null || candles.length >= 2;

        if (!hasData) {
          results.push({
            sector,
            name: info.name,
            symbol: info.symbol,
            status: 'UNAVAILABLE',
            quote: null,
            error: 'No market quote or historical candles available',
          });
          continue;
        }

        const lastCandle = candles[candles.length - 1];
        const prevCandle = candles.length >= 2 ? candles[candles.length - 2] : lastCandle;
        const price = quote?.price ?? lastCandle.close;
        const prevClose = quote?.previousClose ?? prevCandle.close;
        const change = quote?.change ?? (price - prevClose);
        const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

        // Calculate 20-trading-day return
        let return20D: number | undefined;
        if (candles.length >= 21) {
          const close20DaysAgo = candles[candles.length - 21].close;
          if (close20DaysAgo > 0) {
            return20D = Math.round((((price - close20DaysAgo) / close20DaysAgo) * 100) * 100) / 100;
          }
        }

        // Calculate 14-period RSI from closes
        let rsi14: number | undefined;
        if (candles.length >= 15) {
          const closes = candles.map((c) => c.close);
          let gains = 0;
          let losses = 0;
          for (let i = closes.length - 14; i < closes.length; i++) {
            const diff = closes[i] - closes[i - 1];
            if (diff >= 0) gains += diff;
            else losses += Math.abs(diff);
          }
          const avgGain = gains / 14;
          const avgLoss = losses / 14;
          if (avgLoss === 0) {
            rsi14 = 100;
          } else {
            const rs = avgGain / avgLoss;
            rsi14 = Math.round((100 - (100 / (1 + rs))) * 10) / 10;
          }
        }

        // Calculate 0-100 Momentum Score using real inputs
        let momentumScore: number | undefined;
        if (rsi14 !== undefined && return20D !== undefined) {
          const rsiPart = Math.max(0, Math.min(50, rsi14 * 0.5));
          const retPart = Math.max(0, Math.min(50, 25 + (return20D * 2.5)));
          momentumScore = Math.round(rsiPart + retPart);
        }

        results.push({
          sector,
          name: info.name,
          symbol: info.symbol,
          status: 'OK',
          quote: quote || {
            symbol: info.symbol,
            price,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            volume: lastCandle.volume,
            dayHigh: lastCandle.high,
            dayLow: lastCandle.low,
            fiftyTwoWeekHigh: lastCandle.high,
            fiftyTwoWeekLow: lastCandle.low,
            previousClose: prevClose,
            timestamp: lastCandle.timestamp,
            updatedAt: formatISTDateTime(),
            source: this.name,
          },
          price: Math.round(price * 100) / 100,
          changePercent: Math.round(changePercent * 100) / 100,
          return20D,
          rsi14,
          momentumScore,
        });
      } catch (err: any) {
        results.push({
          sector,
          name: info.name,
          symbol: info.symbol,
          status: 'UNAVAILABLE',
          quote: null,
          error: err.message,
        });
      }
    }
    return results;
  }

  async checkHealth(): Promise<{ configured: boolean; reachable: boolean; latencyMs?: number; error?: string }> {
    try {
      const url = `https://query2.finance.yahoo.com/v8/finance/chart/%5ENSEI?interval=1d&range=1d`;
      const { response, durationMs } = await this.fetchWithTimeout(
        url,
        { headers: this.getHeaders() },
        5000,
        { symbol: 'NIFTY50', action: 'healthCheck' }
      );
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
