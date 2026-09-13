import { OHLCV } from '../../shared/types.ts';

export type MarketStatus = 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'HOLIDAY' | 'WEEKEND';

export interface MarketStatusInfo {
  marketStatus: MarketStatus;
  isOpen: boolean;
  currentIstTime: string;
  tradingDate: string;
  lastSessionClose: string;
  isDelayed: boolean;
  message: string;
}

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
  isDelayed?: boolean;
  marketStatus?: MarketStatus;
}

export interface HistoricalDataResult {
  symbol: string;
  timeframe: 'daily' | 'weekly' | 'intraday';
  candles: OHLCV[];
  status: 'FRESH' | 'STALE' | 'INSUFFICIENT' | 'ERROR';
  source: string;
  updatedAt: string;
  error?: string;
  rawCount?: number;
}

export interface SectorDataResult {
  sector: string;
  name: string;
  symbol: string;
  status: 'OK' | 'UNAVAILABLE';
  quote: MarketQuote | null;
  price?: number;
  changePercent?: number;
  return20D?: number;
  rsi14?: number;
  ema50?: number;
  momentumScore?: number;
  error?: string;
}

export interface StructuredMarketError {
  code: 'PROVIDER_TIMEOUT' | 'PROVIDER_ERROR' | 'MARKET_DATA_UNAVAILABLE' | 'RATE_LIMITED' | 'INVALID_SYMBOL' | 'INSUFFICIENT_DATA';
  message: string;
  provider: string;
  symbol?: string;
  timestamp: string;
  httpStatus?: number;
  details?: any;
}

export interface MarketDataProvider {
  readonly name: string;
  isConfigured(): boolean;
  getQuote(symbol: string): Promise<MarketQuote | null>;
  getHistoricalData(symbol: string, timeframe?: 'daily' | 'weekly', range?: string): Promise<HistoricalDataResult>;
  getIntradayData(symbol: string, interval?: string): Promise<HistoricalDataResult>;
  getIndexData(indexSymbol: string): Promise<{ quote: MarketQuote | null; history: HistoricalDataResult }>;
  getSectorData(): Promise<SectorDataResult[]>;
  checkHealth(): Promise<{ configured: boolean; reachable: boolean; latencyMs?: number; error?: string }>;
}
