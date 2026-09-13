import type { OHLCV } from '../../shared/types.ts';
import type { UpstoxCandlesResponse, UpstoxMarketQuoteResponse, UpstoxQuoteItem } from './types.ts';

export class UpstoxClient {
  private readonly baseUrl = 'https://api.upstox.com';

  /**
   * Lazily retrieves the access token from environment variables.
   * This guarantees that any changes to process.env are picked up immediately.
   */
  private getToken(): string {
    return (process.env.UPSTOX_ACCESS_TOKEN || '').trim();
  }

  public isConfigured(): boolean {
    return Boolean(this.getToken().length > 0);
  }

  private getHeaders(): Record<string, string> {
    const token = this.getToken();
    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'User-Agent': 'NSE-Stock-Screener/2.0',
    };
  }

  /**
   * Safe fetch with timeout, latency tracking, and retry on transient errors
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    timeoutMs = 10000,
    maxRetries = 2
  ): Promise<{ response: Response; durationMs: number }> {
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const start = Date.now();

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            ...this.getHeaders(),
            ...(options.headers || {}),
          },
        });

        const durationMs = Date.now() - start;
        clearTimeout(timeoutId);

        // Retry on 429 (rate limited) or 5xx server errors
        if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
          console.warn(`[UpstoxClient] HTTP ${response.status} on attempt ${attempt}, retrying in ${attempt * 400}ms...`);
          await new Promise((r) => setTimeout(r, attempt * 400));
          continue;
        }

        return { response, durationMs };
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = err;
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, attempt * 400));
        }
      }
    }

    throw lastError || new Error('Network request failed after retries');
  }

  /**
   * Fetches full market quotes for one or multiple instrument keys (batched in chunks of 50)
   */
  public async getQuotes(instrumentKeys: string[]): Promise<Map<string, UpstoxQuoteItem>> {
    const resultMap = new Map<string, UpstoxQuoteItem>();
    if (!this.isConfigured() || instrumentKeys.length === 0) {
      return resultMap;
    }

    // Filter unique keys
    const uniqueKeys = Array.from(new Set(instrumentKeys.filter(Boolean)));
    const CHUNK_SIZE = 50;

    for (let i = 0; i < uniqueKeys.length; i += CHUNK_SIZE) {
      const chunk = uniqueKeys.slice(i, i + CHUNK_SIZE);
      const encodedKeys = chunk.map((k) => encodeURIComponent(k)).join(',');
      // Prefer V3 market quotes for complete year_high, year_low, and prev_close_price
      const url = `${this.baseUrl}/v3/market-quote/quotes?instrument_key=${encodedKeys}`;

      try {
        const { response } = await this.fetchWithRetry(url, {}, 9000);
        if (!response.ok) {
          console.warn(`[UpstoxClient] Market quote request failed with status: ${response.status}`);
          continue;
        }

        const json: UpstoxMarketQuoteResponse = await response.json();
        if (json.status === 'success' && json.data) {
          for (const [key, quote] of Object.entries(json.data)) {
            // Map the returned key (e.g. "NSE_EQ:RELIANCE")
            resultMap.set(key, quote);
            // Map the standard pipe token (e.g. "NSE_EQ|INE002A01018")
            if (quote.instrument_token) {
              resultMap.set(quote.instrument_token, quote);
            }
            // Map trading symbol (e.g. "RELIANCE")
            if (quote.symbol && quote.symbol !== 'NA') {
              resultMap.set(quote.symbol.toUpperCase(), quote);
            }
          }
        }
      } catch (err: any) {
        console.warn(`[UpstoxClient] Failed to fetch quotes chunk: ${err.message}`);
      }
    }

    return resultMap;
  }

  /**
   * Fetches historical candle bars for an instrument key
   */
  public async getHistoricalCandles(
    instrumentKey: string,
    interval: 'day' | 'week' | 'month' | '30minute' | '1minute',
    toDate: string,
    fromDate: string
  ): Promise<OHLCV[]> {
    if (!this.isConfigured() || !instrumentKey) {
      return [];
    }

    const encodedKey = encodeURIComponent(instrumentKey);
    const url = `${this.baseUrl}/v2/historical-candle/${encodedKey}/${interval}/${toDate}/${fromDate}`;

    try {
      const { response } = await this.fetchWithRetry(url, {}, 10000);
      if (!response.ok) {
        console.warn(`[UpstoxClient] Candle request failed for ${instrumentKey}: HTTP ${response.status}`);
        return [];
      }

      const json: UpstoxCandlesResponse = await response.json();
      const rawCandles = json.data?.candles || [];
      if (!Array.isArray(rawCandles) || rawCandles.length === 0) {
        return [];
      }

      // Convert raw array [timestamp, open, high, low, close, volume, oi] to OHLCV
      const candles: OHLCV[] = [];
      for (const c of rawCandles) {
        const [timeStr, open, high, low, close, volume] = c;
        if (
          typeof open !== 'number' || isNaN(open) ||
          typeof high !== 'number' || isNaN(high) ||
          typeof low !== 'number' || isNaN(low) ||
          typeof close !== 'number' || isNaN(close)
        ) {
          continue;
        }

        const timestamp = new Date(timeStr).getTime();
        const dateStr = timeStr.split('T')[0];

        candles.push({
          timestamp,
          open: Math.round(open * 100) / 100,
          high: Math.round(high * 100) / 100,
          low: Math.round(low * 100) / 100,
          close: Math.round(close * 100) / 100,
          volume: Math.round(volume || 0),
          dateStr,
        });
      }

      // Upstox returns newest candles first; technical indicators require oldest first (chronological)
      candles.sort((a, b) => a.timestamp - b.timestamp);
      return candles;
    } catch (err: any) {
      console.warn(`[UpstoxClient] Historical candles error for ${instrumentKey}: ${err.message}`);
      return [];
    }
  }

  /**
   * Fetches intraday candles for an instrument key (falls back to recent minute candles if intraday is empty)
   */
  public async getIntradayCandles(instrumentKey: string, interval = '30minute'): Promise<OHLCV[]> {
    if (!this.isConfigured() || !instrumentKey) {
      return [];
    }

    const encodedKey = encodeURIComponent(instrumentKey);
    const validInterval = interval === '1m' || interval === '1min' ? '1minute' : '30minute';
    const url = `${this.baseUrl}/v2/historical-candle/intraday/${encodedKey}/${validInterval}`;

    try {
      const { response } = await this.fetchWithRetry(url, {}, 8000);
      if (response.ok) {
        const json: UpstoxCandlesResponse = await response.json();
        const rawCandles = json.data?.candles || [];
        if (Array.isArray(rawCandles) && rawCandles.length > 0) {
          const candles: OHLCV[] = rawCandles.map((c) => ({
            timestamp: new Date(c[0]).getTime(),
            open: Math.round(c[1] * 100) / 100,
            high: Math.round(c[2] * 100) / 100,
            low: Math.round(c[3] * 100) / 100,
            close: Math.round(c[4] * 100) / 100,
            volume: Math.round(c[5] || 0),
            dateStr: c[0].split('T')[0],
          })).sort((a, b) => a.timestamp - b.timestamp);

          return candles;
        }
      }
    } catch (e: any) {
      console.warn(`[UpstoxClient] Live intraday endpoint failed for ${instrumentKey}: ${e.message}`);
    }

    // Fallback: If today is a weekend or closed market hours, query recent 5 days of 30-minute candles
    const today = new Date();
    const toDate = today.toISOString().split('T')[0];
    const past = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000);
    const fromDate = past.toISOString().split('T')[0];

    return this.getHistoricalCandles(instrumentKey, validInterval as any, toDate, fromDate);
  }

  /**
   * Health check for Upstox connectivity
   */
  public async checkHealth(): Promise<{ configured: boolean; reachable: boolean; latencyMs?: number; error?: string }> {
    if (!this.isConfigured()) {
      return {
        configured: false,
        reachable: false,
        error: 'UPSTOX_ACCESS_TOKEN environment variable is not configured',
      };
    }

    try {
      const start = Date.now();
      const url = `${this.baseUrl}/v3/market-quote/quotes?instrument_key=NSE_INDEX%7CNifty%2050`;
      const { response, durationMs } = await this.fetchWithRetry(url, {}, 6000, 1);

      if (response.ok) {
        return {
          configured: true,
          reachable: true,
          latencyMs: durationMs,
        };
      }

      const body = await response.text();
      return {
        configured: true,
        reachable: false,
        latencyMs: Date.now() - start,
        error: `Upstox API responded with HTTP ${response.status}: ${body.slice(0, 100)}`,
      };
    } catch (err: any) {
      return {
        configured: true,
        reachable: false,
        error: err.message || 'Failed to connect to Upstox API',
      };
    }
  }
}

export const upstoxClient = new UpstoxClient();
