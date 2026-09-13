import { HistoricalDataResult, MarketDataProvider, MarketQuote, SectorDataResult, StructuredMarketError } from '../types.ts';

export abstract class BaseMarketDataProvider implements MarketDataProvider {
  abstract readonly name: string;
  abstract isConfigured(): boolean;
  abstract getQuote(symbol: string): Promise<MarketQuote | null>;
  abstract getHistoricalData(symbol: string, timeframe?: 'daily' | 'weekly', range?: string): Promise<HistoricalDataResult>;
  abstract getIntradayData(symbol: string, interval?: string): Promise<HistoricalDataResult>;
  abstract getIndexData(indexSymbol: string): Promise<{ quote: MarketQuote | null; history: HistoricalDataResult }>;
  abstract getSectorData(): Promise<SectorDataResult[]>;
  abstract checkHealth(): Promise<{ configured: boolean; reachable: boolean; latencyMs?: number; error?: string }>;

  /**
   * Helper to perform HTTP GET requests with timeout and latency tracking
   */
  protected async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeoutMs = 9000,
    meta: { symbol?: string; action?: string; attempt?: number } = {}
  ): Promise<{ response: Response; durationMs: number }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const start = Date.now();

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      const durationMs = Date.now() - start;

      // Log server-side diagnostic (no secrets)
      const sanitizedUrl = url.replace(/apikey=[^&]+/i, 'apikey=***');
      if (!response.ok) {
        console.warn(
          `[${this.name}] Request failed: ${response.status} ${response.statusText} in ${durationMs}ms | Action: ${meta.action || 'fetch'} | Symbol: ${meta.symbol || 'N/A'} | Attempt: ${meta.attempt || 1} | URL: ${sanitizedUrl}`
        );
      }

      return { response, durationMs };
    } catch (error: any) {
      const durationMs = Date.now() - start;
      const sanitizedUrl = url.replace(/apikey=[^&]+/i, 'apikey=***');
      const isTimeout = error.name === 'AbortError';

      console.error(
        `[${this.name}] Network error (${isTimeout ? 'TIMEOUT' : error.message}) after ${durationMs}ms | Action: ${meta.action || 'fetch'} | Symbol: ${meta.symbol || 'N/A'} | Attempt: ${meta.attempt || 1} | URL: ${sanitizedUrl}`
      );
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Constructs a structured, compliant error object
   */
  protected createError(
    code: StructuredMarketError['code'],
    message: string,
    symbol?: string,
    httpStatus?: number,
    details?: any
  ): StructuredMarketError {
    return {
      code,
      message,
      provider: this.name,
      symbol,
      timestamp: new Date().toISOString(),
      httpStatus,
      details,
    };
  }
}
