export interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  dateStr: string;
}

export interface TechnicalIndicators {
  // Trend
  ema20: number;
  ema50: number;
  ema100: number;
  ema200: number;
  sma50: number;
  sma200: number;
  priceVsEma20: number; // % distance
  priceVsEma50: number;
  priceVsEma200: number;
  ema20VsEma50: number;
  ema50VsEma200: number;
  trendDirection: 'BULLISH' | 'BEARISH' | 'NEUTRAL';

  // Momentum
  rsi14: number;
  macd: {
    line: number;
    signal: number;
    histogram: number;
    crossover: 'BULLISH' | 'BEARISH' | 'NONE';
  };
  adx14: {
    adx: number;
    plusDI: number;
    minusDI: number;
    strength: 'STRONG' | 'MODERATE' | 'WEAK';
  };
  roc: number; // Rate of change 14-period %

  // Volatility
  atr14: number;
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number; // (upper - lower) / middle * 100
    percentB: number;  // (price - lower) / (upper - lower)
  };

  // Volume
  avgVolume20: number;
  volumeRatio: number; // current volume / 20d avg
  obv: number;
  volumeBreakout: boolean; // volume > 2x 20d avg

  // Price Structure
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  distFrom52wHigh: number; // %
  distFrom52wLow: number;  // %
  nearestSupport: number;
  nearestResistance: number;
  supportStrength: number;    // 1-10 scale
  resistanceStrength: number; // 1-10 scale
}

export interface DetectedPattern {
  pattern: string;
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore: number; // e.g. 85%
  detected_at: string;
  support: number;
  resistance: number;
  description: string;
  isPossible?: boolean; // when confidence is low
}

export interface NiftyMarketConfirmation {
  niftyPrice: number;
  change: number;
  changePercent: number;
  trend: 'STRONG BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG BEARISH';
  ema20: number;
  ema50: number;
  ema200: number;
  rsi: number;
  momentum: string;
  regime: 'STRONG BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG BEARISH';
  confirmationStatus: 'STRONG' | 'MODERATE' | 'WEAK' | 'CONFLICTING';
}

export interface SectorConfirmation {
  sectorName: string;
  sectorIndexSymbol: string;
  sectorPrice: number;
  sectorChangePercent: number;
  sectorTrend: 'STRONG BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG BEARISH';
  sectorMomentum: number;
  stockRelativeStrengthVsSector: number; // % outperformance
  sectorRelativeStrengthVsNifty: number; // % outperformance
  confirmation: 'STRONG' | 'MODERATE' | 'WEAK' | 'CONFLICTING';
}

export interface ScannerWeights {
  trend: number;
  momentum: number;
  volume: number;
  pattern: number;
  market: number;
  sector: number;
  risk: number;
}

export interface ScoreBreakdown {
  trend: number;
  maxTrend: number;
  momentum: number;
  maxMomentum: number;
  volume: number;
  maxVolume: number;
  pattern: number;
  maxPattern: number;
  market: number;
  maxMarket: number;
  sector: number;
  maxSector: number;
  risk: number;
  maxRisk: number;
}

export type ScannerSignalType = 'STRONG BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG BEARISH';

export interface StockScanResult {
  symbol: string;
  name: string;
  sector: string;
  series?: string;
  marketCapCategory?: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  score: number; // 0-100
  signal: ScannerSignalType;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  primary_signal: string;
  secondary_signals: string[];
  score_breakdown: ScoreBreakdown;
  breakdown: ScoreBreakdown;
  indicators: TechnicalIndicators;
  patterns: DetectedPattern[];
  nifty: NiftyMarketConfirmation;
  sector_conf: SectorConfirmation;
  data_status: 'FRESH' | 'STALE' | 'INSUFFICIENT' | 'ERROR';
  dataStatus?: 'FRESH' | 'STALE' | 'INSUFFICIENT' | 'ERROR';
  data_source?: string;
  last_updated: string;
  lastUpdated?: string;
  timeframe: 'daily' | 'weekly';
  is_holding?: boolean;
  isHolding?: boolean;
  holding_info?: {
    quantity: number;
    avgPrice: number;
    invested: number;
    currentValue: number;
    pnl: number;
    pnlPercent: number;
  };
  holdingDetails?: {
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    pnl: number;
    pnlPercent: number;
  };
  in_watchlist?: boolean;
  isWatchlist?: boolean;
}

export type ScannerPresetType =
  | 'ALL'
  | 'MOMENTUM_LEADERS'
  | 'BULLISH_BREAKOUT'
  | 'BEARISH_BREAKDOWN'
  | 'GOLDEN_CROSS'
  | 'DEATH_CROSS'
  | 'HIGH_VOLUME'
  | '52W_HIGH'
  | '52W_LOW'
  | 'OVERSOLD_REVERSAL'
  | 'TIGHT_CONSOLIDATION';

export interface ScannerFilterOptions {
  universe?: string;
  timeframe?: 'daily' | 'weekly';
  preset?: ScannerPresetType;
  minScore?: number;
  maxScore?: number;
  signal?: ScannerSignalType | 'ALL' | 'BULLISH_ALL' | 'BEARISH_ALL';
  sector?: string;
  minVolumeRatio?: number;
  minPrice?: number;
  maxPrice?: number;
  minRsi?: number;
  maxRsi?: number;
  aboveEma20?: boolean;
  aboveEma50?: boolean;
  aboveEma200?: boolean;
  onlyHoldings?: boolean;
  onlyWatchlist?: boolean;
  searchQuery?: string;
  search?: string;
}

export interface ScannerSummary {
  totalScanned: number;
  strongBullishCount: number;
  bullishCount: number;
  neutralCount: number;
  bearishCount: number;
  strongBearishCount: number;
  breakoutCount: number;
  averageVolumeRatio?: number;
  niftyStatus?: NiftyMarketConfirmation;
  topSetups?: any[];
  topGainers?: any[];
  topLosers?: any[];
  marketBreadth: {
    advancing: number;
    declining: number;
    unchanged: number;
  };
  scanTimestamp?: string;
  scannedAt?: string;
}



export interface AIAnalysisResult {
  symbol: string;
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  keyPositives: string[];
  keyRisks: string[];
  technicalSetup: string;
  confirmation: string;
  invalidation: string;
  setupType: string;
  generatedAt: string;
  isAiGenerated: boolean;
}

export interface BacktestRecord {
  id: string;
  signal_date: string;
  symbol: string;
  signal: ScannerSignalType;
  score: number;
  entry_price: number;
  price_after_5_days: number | null;
  price_after_10_days: number | null;
  price_after_20_days: number | null;
  price_after_60_days: number | null;
  return_5d: number | null;
  return_10d: number | null;
  return_20d: number | null;
  return_60d: number | null;
  maximum_gain: number;
  maximum_drawdown: number;
  status: 'WIN' | 'LOSS' | 'OPEN';
}

export interface BacktestSummary {
  totalSignals: number;
  bullishSignals: number;
  bearishSignals: number;
  winRate5d: number;
  winRate10d: number;
  winRate20d: number;
  winRate60d: number;
  averageReturn: number;
  medianReturn: number;
  maxDrawdown: number;
  bestTrade: { symbol: string; gain: number; date: string } | null;
  worstTrade: { symbol: string; loss: number; date: string } | null;
  records: BacktestRecord[];
}

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  invested: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  dayGain: number;
  dayGainPercent: number;
  updatedAt: string;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  addedAt: string;
  notes?: string;
}

export interface AlertRule {
  id: string;
  symbol: string; // symbol or 'ALL'
  name: string;
  type:
    | 'SCORE_ABOVE'
    | 'BULLISH_BREAKOUT'
    | 'BEARISH_BREAKDOWN'
    | 'VOLUME_2X'
    | 'EMA_CROSS_BULLISH'
    | 'EMA_CROSS_BEARISH'
    | 'RSI_ABOVE_50'
    | 'RSI_BELOW_50'
    | '52W_HIGH'
    | '52W_LOW';
  threshold?: number;
  enabled: boolean;
  createdAt: string;
  lastTriggered?: string;
  triggerMessage?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export const AVAILABLE_UNIVERSES = [
  { id: 'nifty50', label: 'NIFTY 50' },
  { id: 'nifty100', label: 'NIFTY 100' },
  { id: 'nifty200', label: 'NIFTY 200' },
  { id: 'nifty_bank', label: 'NIFTY Bank' },
  { id: 'nifty_it', label: 'NIFTY IT' },
  { id: 'nifty_auto', label: 'NIFTY Auto' },
  { id: 'nifty_pharma', label: 'NIFTY Pharma' },
  { id: 'nifty_fmcg', label: 'NIFTY FMCG' },
  { id: 'nifty_metal', label: 'NIFTY Metal' },
  { id: 'holdings', label: 'My Portfolio Holdings' },
  { id: 'watchlist', label: 'My Watchlist' },
] as const;
