export interface UpstoxOHLC {
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  ts?: number;
}

export interface UpstoxDepthLevel {
  quantity: number;
  price: number;
  orders: number;
}

export interface UpstoxDepth {
  buy?: UpstoxDepthLevel[];
  sell?: UpstoxDepthLevel[];
}

export interface UpstoxQuoteItem {
  ohlc: UpstoxOHLC;
  depth?: UpstoxDepth;
  timestamp?: string;
  instrument_token: string;
  symbol: string;
  last_price: number;
  volume?: number | null;
  average_price?: number | null;
  oi?: number | null;
  net_change: number;
  total_buy_quantity?: number | null;
  total_sell_quantity?: number | null;
  lower_circuit_limit?: number | null;
  upper_circuit_limit?: number | null;
  last_trade_time?: string | null;
  prev_close_price?: number | null;
  year_high?: number | null;
  year_low?: number | null;
}

export interface UpstoxMarketQuoteResponse {
  status: 'success' | 'error';
  data?: Record<string, UpstoxQuoteItem>;
  errors?: Array<{ errorCode: string; message: string }>;
}

export interface UpstoxCandlesResponse {
  status: 'success' | 'error';
  data?: {
    candles?: Array<[string, number, number, number, number, number, number]>;
  };
  errors?: Array<{ errorCode: string; message: string }>;
}

export interface UpstoxInstrumentItem {
  segment: string;
  name: string;
  exchange: string;
  isin?: string;
  instrument_type: string;
  instrument_key: string;
  trading_symbol: string;
  short_name?: string;
}
