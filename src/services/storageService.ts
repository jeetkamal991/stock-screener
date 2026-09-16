import {
  AlertRule,
  Holding,
  NiftyMarketConfirmation,
  OHLCV,
  ScannerSummary,
  SectorConfirmation,
  StockScanResult,
  UserProfile,
  WatchlistItem,
} from '../types.ts';

const STORAGE_KEYS = {
  HOLDINGS: 'nse_screener_holdings_v1',
  WATCHLIST: 'nse_screener_watchlist_v1',
  ALERTS: 'nse_screener_alerts_v1',
  CACHED_SCAN: 'nse_screener_scan_cache_v1',
  CACHED_SUMMARY: 'nse_screener_scan_summary_v1',
  CACHED_NIFTY: 'nse_screener_nifty_v1',
  CACHED_SECTORS: 'nse_screener_sectors_v1',
  DATA_SOURCE_MODE: 'nse_screener_source_mode_v1', // 'auto' | 'browser'
};

// Initial default user
export const DEFAULT_USER: UserProfile = {
  id: 'user_1',
  name: 'Rohan Sharma',
  email: 'rohan.sharma@trader.in',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
};

// Initial realistic test holdings
export const DEFAULT_HOLDINGS: Holding[] = [
  {
    id: 'hold-1',
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    sector: 'Oil, Gas & Energy',
    quantity: 15,
    avgPrice: 2820.5,
    currentPrice: 2942.3,
    invested: 42307.5,
    currentValue: 44134.5,
    pnl: 1827.0,
    pnlPercent: 4.32,
    dayGain: 312.4,
    dayGainPercent: 0.71,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hold-2',
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    sector: 'Information Technology',
    quantity: 10,
    avgPrice: 4120.0,
    currentPrice: 4245.8,
    invested: 41200.0,
    currentValue: 42458.0,
    pnl: 1258.0,
    pnlPercent: 3.05,
    dayGain: -180.5,
    dayGainPercent: -0.42,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hold-3',
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    sector: 'Banking & Financials',
    quantity: 25,
    avgPrice: 1610.0,
    currentPrice: 1685.2,
    invested: 40250.0,
    currentValue: 42130.0,
    pnl: 1880.0,
    pnlPercent: 4.67,
    dayGain: 420.0,
    dayGainPercent: 1.01,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hold-4',
    symbol: 'INFY',
    name: 'Infosys Ltd.',
    sector: 'Information Technology',
    quantity: 20,
    avgPrice: 1740.0,
    currentPrice: 1892.4,
    invested: 34800.0,
    currentValue: 37848.0,
    pnl: 3048.0,
    pnlPercent: 8.76,
    dayGain: 285.6,
    dayGainPercent: 0.76,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'hold-5',
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd.',
    sector: 'Automobiles & Auto Components',
    quantity: 40,
    avgPrice: 910.0,
    currentPrice: 984.5,
    invested: 36400.0,
    currentValue: 39380.0,
    pnl: 2980.0,
    pnlPercent: 8.19,
    dayGain: 510.0,
    dayGainPercent: 1.31,
    updatedAt: new Date().toISOString(),
  },
];

// Initial realistic test watchlist
export const DEFAULT_WATCHLIST: WatchlistItem[] = [
  {
    symbol: 'DIVISLAB',
    name: "Divi's Laboratories Ltd.",
    sector: 'Pharmaceuticals & Healthcare',
    price: 6185.0,
    change: 142.5,
    changePercent: 2.36,
    addedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    notes: 'Bullish cup & handle continuation above 20 EMA',
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd.',
    sector: 'Telecommunications',
    price: 1682.4,
    change: 18.2,
    changePercent: 1.09,
    addedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    notes: 'Testing all-time high resistance band with high volume',
  },
  {
    symbol: 'SUNPHARMA',
    name: 'Sun Pharmaceutical Industries Ltd.',
    sector: 'Pharmaceuticals & Healthcare',
    price: 1894.0,
    change: 22.8,
    changePercent: 1.22,
    addedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    notes: 'Pharma sector relative strength leader vs Nifty',
  },
  {
    symbol: 'LT',
    name: 'Larsen & Toubro Ltd.',
    sector: 'Infrastructure',
    price: 3580.0,
    change: -12.4,
    changePercent: -0.35,
    addedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    notes: 'Order book expansion momentum, awaiting consolidation breakout',
  },
  {
    symbol: 'TITAN',
    name: 'Titan Company Ltd.',
    sector: 'Consumer Discretionary',
    price: 3420.5,
    change: 35.0,
    changePercent: 1.03,
    addedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    notes: 'Approaching support at 50 EMA with oversold RSI',
  },
];

// Initial active alerts
export const DEFAULT_ALERTS: AlertRule[] = [
  {
    id: 'alert-1',
    symbol: 'ALL',
    name: 'AI Score >= 80 High Conviction',
    type: 'SCORE_ABOVE',
    threshold: 80,
    enabled: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    lastTriggered: new Date(Date.now() - 30 * 60000).toISOString(),
    triggerMessage: 'DIVISLAB scored 88 (>= 80) with Bullish Breakout',
  },
  {
    id: 'alert-2',
    symbol: 'ALL',
    name: 'Bullish Technical Breakout',
    type: 'BULLISH_BREAKOUT',
    enabled: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    lastTriggered: new Date(Date.now() - 2 * 3600000).toISOString(),
    triggerMessage: 'SUNPHARMA triggered Bullish Breakout pattern',
  },
  {
    id: 'alert-3',
    symbol: 'ALL',
    name: 'Volume Spike > 2.0x 20D Average',
    type: 'VOLUME_2X',
    enabled: true,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'alert-4',
    symbol: 'ALL',
    name: '52-Week High Near Resistance',
    type: '52W_HIGH',
    enabled: true,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

// Default NIFTY Market Confirmation
export const DEFAULT_NIFTY: NiftyMarketConfirmation = {
  niftyPrice: 24350.25,
  change: 125.4,
  changePercent: 0.52,
  trend: 'BULLISH',
  ema20: 24180.5,
  ema50: 23950.0,
  ema200: 23200.0,
  rsi: 58.4,
  momentum: 'Positive momentum above 20 EMA with bullish market breadth',
  regime: 'BULLISH',
  confirmationStatus: 'STRONG',
};

// Default Sector Momentum
export const DEFAULT_SECTORS: SectorConfirmation[] = [
  {
    sectorName: 'Pharmaceuticals & Healthcare',
    sectorIndexSymbol: 'NIFTYPHARMA',
    sectorPrice: 22450.0,
    sectorChangePercent: 1.45,
    sectorTrend: 'STRONG BULLISH',
    sectorMomentum: 88,
    stockRelativeStrengthVsSector: 1.8,
    sectorRelativeStrengthVsNifty: 0.93,
    confirmation: 'STRONG',
  },
  {
    sectorName: 'Information Technology',
    sectorIndexSymbol: 'NIFTYIT',
    sectorPrice: 41820.0,
    sectorChangePercent: 0.85,
    sectorTrend: 'BULLISH',
    sectorMomentum: 78,
    stockRelativeStrengthVsSector: 0.5,
    sectorRelativeStrengthVsNifty: 0.33,
    confirmation: 'STRONG',
  },
  {
    sectorName: 'Banking & Financials',
    sectorIndexSymbol: 'BANKNIFTY',
    sectorPrice: 51240.0,
    sectorChangePercent: 0.62,
    sectorTrend: 'BULLISH',
    sectorMomentum: 74,
    stockRelativeStrengthVsSector: 0.3,
    sectorRelativeStrengthVsNifty: 0.1,
    confirmation: 'MODERATE',
  },
  {
    sectorName: 'Automobiles & Auto Components',
    sectorIndexSymbol: 'NIFTYAUTO',
    sectorPrice: 25680.0,
    sectorChangePercent: 0.72,
    sectorTrend: 'BULLISH',
    sectorMomentum: 76,
    stockRelativeStrengthVsSector: 0.4,
    sectorRelativeStrengthVsNifty: 0.2,
    confirmation: 'STRONG',
  },
  {
    sectorName: 'Fast Moving Consumer Goods',
    sectorIndexSymbol: 'NIFTYFMCG',
    sectorPrice: 58900.0,
    sectorChangePercent: -0.15,
    sectorTrend: 'NEUTRAL',
    sectorMomentum: 52,
    stockRelativeStrengthVsSector: -0.2,
    sectorRelativeStrengthVsNifty: -0.67,
    confirmation: 'WEAK',
  },
  {
    sectorName: 'Metals & Mining',
    sectorIndexSymbol: 'NIFTYMETAL',
    sectorPrice: 9420.0,
    sectorChangePercent: 1.1,
    sectorTrend: 'BULLISH',
    sectorMomentum: 72,
    stockRelativeStrengthVsSector: 0.6,
    sectorRelativeStrengthVsNifty: 0.58,
    confirmation: 'STRONG',
  },
  {
    sectorName: 'Oil, Gas & Energy',
    sectorIndexSymbol: 'NIFTYENERGY',
    sectorPrice: 38400.0,
    sectorChangePercent: 0.45,
    sectorTrend: 'BULLISH',
    sectorMomentum: 68,
    stockRelativeStrengthVsSector: 0.1,
    sectorRelativeStrengthVsNifty: -0.07,
    confirmation: 'MODERATE',
  },
  {
    sectorName: 'Infrastructure',
    sectorIndexSymbol: 'NIFTYINFRA',
    sectorPrice: 8750.0,
    sectorChangePercent: 0.3,
    sectorTrend: 'NEUTRAL',
    sectorMomentum: 62,
    stockRelativeStrengthVsSector: 0.0,
    sectorRelativeStrengthVsNifty: -0.22,
    confirmation: 'MODERATE',
  },
];

// Seed rich pre-computed test scan results
export const DEFAULT_SCAN_RESULTS: StockScanResult[] = [
  {
    symbol: 'DIVISLAB',
    name: "Divi's Laboratories Ltd.",
    sector: 'Pharmaceuticals & Healthcare',
    series: 'EQ',
    marketCapCategory: 'Large Cap',
    price: 6185.0,
    change: 142.5,
    changePercent: 2.36,
    volume: 1240500,
    score: 88,
    signal: 'STRONG BULLISH',
    confidence: 'HIGH',
    primary_signal: 'Bullish Momentum Breakout above 20 EMA with 2.4x Volume',
    secondary_signals: [
      'MACD Bullish Histogram Expansion',
      'RSI 64 in strong bullish acceleration zone',
      'Sector leader in NIFTY Pharma with +1.8% relative strength',
    ],
    score_breakdown: {
      trend: 24,
      maxTrend: 25,
      momentum: 23,
      maxMomentum: 25,
      volume: 18,
      maxVolume: 20,
      pattern: 13,
      maxPattern: 15,
      market: 5,
      maxMarket: 5,
      sector: 5,
      maxSector: 5,
      risk: 0,
      maxRisk: 5,
    },
    breakdown: {
      trend: 24,
      maxTrend: 25,
      momentum: 23,
      maxMomentum: 25,
      volume: 18,
      maxVolume: 20,
      pattern: 13,
      maxPattern: 15,
      market: 5,
      maxMarket: 5,
      sector: 5,
      maxSector: 5,
      risk: 0,
      maxRisk: 5,
    },
    indicators: {
      ema20: 5980.2,
      ema50: 5740.0,
      ema100: 5410.0,
      ema200: 4980.5,
      sma50: 5730.0,
      sma200: 4970.0,
      priceVsEma20: 3.42,
      priceVsEma50: 7.75,
      priceVsEma200: 24.18,
      ema20VsEma50: 4.18,
      ema50VsEma200: 15.25,
      trendDirection: 'BULLISH',
      rsi14: 64.8,
      macd: {
        line: 98.4,
        signal: 72.1,
        histogram: 26.3,
        crossover: 'BULLISH',
      },
      adx14: {
        adx: 32.4,
        plusDI: 36.2,
        minusDI: 14.1,
        strength: 'STRONG',
      },
      roc: 6.8,
      atr14: 112.5,
      bollingerBands: {
        upper: 6250.0,
        middle: 5980.0,
        lower: 5710.0,
        bandwidth: 9.03,
        percentB: 0.88,
      },
      avgVolume20: 520000,
      volumeRatio: 2.38,
      obv: 8940000,
      volumeBreakout: true,
      fiftyTwoWeekHigh: 6220.0,
      fiftyTwoWeekLow: 3410.0,
      distFrom52wHigh: -0.56,
      distFrom52wLow: 81.38,
      nearestSupport: 5980.0,
      nearestResistance: 6250.0,
      supportStrength: 9,
      resistanceStrength: 7,
    },
    patterns: [
      {
        pattern: 'Ascending Triangle Breakout',
        direction: 'BULLISH',
        confidence: 'HIGH',
        confidenceScore: 89,
        detected_at: new Date().toISOString(),
        support: 5980.0,
        resistance: 6200.0,
        description: 'Clean horizontal ceiling breakout on elevated volume with higher swing lows',
      },
    ],
    nifty: DEFAULT_NIFTY,
    sector_conf: DEFAULT_SECTORS[0],
    data_status: 'FRESH',
    timeframe: 'daily',
    last_updated: new Date().toISOString(),
    isWatchlist: true,
  },
  {
    symbol: 'SUNPHARMA',
    name: 'Sun Pharmaceutical Industries Ltd.',
    sector: 'Pharmaceuticals & Healthcare',
    series: 'EQ',
    marketCapCategory: 'Large Cap',
    price: 1894.0,
    change: 22.8,
    changePercent: 1.22,
    volume: 2450000,
    score: 84,
    signal: 'STRONG BULLISH',
    confidence: 'HIGH',
    primary_signal: 'Trend Continuation & 52-Week High Breakout',
    secondary_signals: [
      'Strong institutional accumulation signature',
      'Price aligned above 20 > 50 > 200 EMA sequence',
      'Bollinger Band expansion with low drawdown',
    ],
    score_breakdown: {
      trend: 23,
      maxTrend: 25,
      momentum: 22,
      maxMomentum: 25,
      volume: 16,
      maxVolume: 20,
      pattern: 13,
      maxPattern: 15,
      market: 5,
      maxMarket: 5,
      sector: 5,
      maxSector: 5,
      risk: 0,
      maxRisk: 5,
    },
    breakdown: {
      trend: 23,
      maxTrend: 25,
      momentum: 22,
      maxMomentum: 25,
      volume: 16,
      maxVolume: 20,
      pattern: 13,
      maxPattern: 15,
      market: 5,
      maxMarket: 5,
      sector: 5,
      maxSector: 5,
      risk: 0,
      maxRisk: 5,
    },
    indicators: {
      ema20: 1845.0,
      ema50: 1780.0,
      ema100: 1690.0,
      ema200: 1550.0,
      sma50: 1775.0,
      sma200: 1545.0,
      priceVsEma20: 2.65,
      priceVsEma50: 6.4,
      priceVsEma200: 22.19,
      ema20VsEma50: 3.65,
      ema50VsEma200: 14.84,
      trendDirection: 'BULLISH',
      rsi14: 62.5,
      macd: {
        line: 32.4,
        signal: 25.1,
        histogram: 7.3,
        crossover: 'BULLISH',
      },
      adx14: {
        adx: 29.8,
        plusDI: 32.1,
        minusDI: 16.4,
        strength: 'STRONG',
      },
      roc: 4.8,
      atr14: 28.5,
      bollingerBands: {
        upper: 1910.0,
        middle: 1845.0,
        lower: 1780.0,
        bandwidth: 7.05,
        percentB: 0.87,
      },
      avgVolume20: 1600000,
      volumeRatio: 1.53,
      obv: 18500000,
      volumeBreakout: false,
      fiftyTwoWeekHigh: 1898.0,
      fiftyTwoWeekLow: 1110.0,
      distFrom52wHigh: -0.21,
      distFrom52wLow: 70.63,
      nearestSupport: 1845.0,
      nearestResistance: 1900.0,
      supportStrength: 8,
      resistanceStrength: 6,
    },
    patterns: [
      {
        pattern: 'Bull Flag Continuation',
        direction: 'BULLISH',
        confidence: 'HIGH',
        confidenceScore: 85,
        detected_at: new Date().toISOString(),
        support: 1845.0,
        resistance: 1898.0,
        description: 'Tight bull flag breakout above multi-week consolidation base',
      },
    ],
    nifty: DEFAULT_NIFTY,
    sector_conf: DEFAULT_SECTORS[0],
    data_status: 'FRESH',
    timeframe: 'daily',
    last_updated: new Date().toISOString(),
    isWatchlist: true,
  },
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    sector: 'Oil, Gas & Energy',
    series: 'EQ',
    marketCapCategory: 'Large Cap',
    price: 2942.3,
    change: 28.5,
    changePercent: 0.98,
    volume: 5800000,
    score: 81,
    signal: 'BULLISH',
    confidence: 'HIGH',
    primary_signal: 'Rebound from 50 EMA Support with Rising OBV',
    secondary_signals: [
      'RSI recovering to 58.2 from mid-band support',
      'MACD line converging toward bullish cross',
      'High institutional heavyweight weighting (9.8% of NIFTY)',
    ],
    score_breakdown: {
      trend: 22,
      maxTrend: 25,
      momentum: 20,
      maxMomentum: 25,
      volume: 17,
      maxVolume: 20,
      pattern: 12,
      maxPattern: 15,
      market: 5,
      maxMarket: 5,
      sector: 5,
      maxSector: 5,
      risk: 0,
      maxRisk: 5,
    },
    breakdown: {
      trend: 22,
      maxTrend: 25,
      momentum: 20,
      maxMomentum: 25,
      volume: 17,
      maxVolume: 20,
      pattern: 12,
      maxPattern: 15,
      market: 5,
      maxMarket: 5,
      sector: 5,
      maxSector: 5,
      risk: 0,
      maxRisk: 5,
    },
    indicators: {
      ema20: 2915.0,
      ema50: 2880.0,
      ema100: 2810.0,
      ema200: 2690.0,
      sma50: 2875.0,
      sma200: 2680.0,
      priceVsEma20: 0.94,
      priceVsEma50: 2.16,
      priceVsEma200: 9.38,
      ema20VsEma50: 1.22,
      ema50VsEma200: 7.06,
      trendDirection: 'BULLISH',
      rsi14: 58.2,
      macd: {
        line: 14.5,
        signal: 11.2,
        histogram: 3.3,
        crossover: 'BULLISH',
      },
      adx14: {
        adx: 24.5,
        plusDI: 28.0,
        minusDI: 20.2,
        strength: 'MODERATE',
      },
      roc: 2.9,
      atr14: 48.0,
      bollingerBands: {
        upper: 2990.0,
        middle: 2915.0,
        lower: 2840.0,
        bandwidth: 5.15,
        percentB: 0.68,
      },
      avgVolume20: 4500000,
      volumeRatio: 1.29,
      obv: 42000000,
      volumeBreakout: false,
      fiftyTwoWeekHigh: 3024.9,
      fiftyTwoWeekLow: 2220.0,
      distFrom52wHigh: -2.73,
      distFrom52wLow: 32.54,
      nearestSupport: 2880.0,
      nearestResistance: 3020.0,
      supportStrength: 8,
      resistanceStrength: 9,
    },
    patterns: [
      {
        pattern: 'Support Rebound off 50 EMA',
        direction: 'BULLISH',
        confidence: 'HIGH',
        confidenceScore: 82,
        detected_at: new Date().toISOString(),
        support: 2880.0,
        resistance: 3020.0,
        description: 'Bullish engulfing candle off daily 50 EMA dynamic support',
      },
    ],
    nifty: DEFAULT_NIFTY,
    sector_conf: DEFAULT_SECTORS[6],
    data_status: 'FRESH',
    timeframe: 'daily',
    last_updated: new Date().toISOString(),
    isHolding: true,
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd.',
    sector: 'Automobiles & Auto Components',
    series: 'EQ',
    marketCapCategory: 'Large Cap',
    price: 984.5,
    change: 14.8,
    changePercent: 1.53,
    volume: 8900000,
    score: 80,
    signal: 'BULLISH',
    confidence: 'HIGH',
    primary_signal: 'Auto Sector Momentum & Breakout above Short-term Range',
    secondary_signals: [
      'RSI 61 entering bullish momentum phase',
      'MACD positive histogram divergence',
      'Healthy volume ratio at 1.45x',
    ],
    score_breakdown: {
      trend: 21,
      maxTrend: 25,
      momentum: 21,
      maxMomentum: 25,
      volume: 16,
      maxVolume: 20,
      pattern: 12,
      maxPattern: 15,
      market: 5,
      maxMarket: 5,
      sector: 5,
      maxSector: 5,
      risk: 0,
      maxRisk: 5,
    },
    breakdown: {
      trend: 21,
      maxTrend: 25,
      momentum: 21,
      maxMomentum: 25,
      volume: 16,
      maxVolume: 20,
      pattern: 12,
      maxPattern: 15,
      market: 5,
      maxMarket: 5,
      sector: 5,
      maxSector: 5,
      risk: 0,
      maxRisk: 5,
    },
    indicators: {
      ema20: 960.0,
      ema50: 938.0,
      ema100: 902.0,
      ema200: 835.0,
      sma50: 935.0,
      sma200: 830.0,
      priceVsEma20: 2.55,
      priceVsEma50: 4.96,
      priceVsEma200: 17.9,
      ema20VsEma50: 2.35,
      ema50VsEma200: 12.33,
      trendDirection: 'BULLISH',
      rsi14: 61.2,
      macd: {
        line: 12.8,
        signal: 9.4,
        histogram: 3.4,
        crossover: 'BULLISH',
      },
      adx14: {
        adx: 27.5,
        plusDI: 30.4,
        minusDI: 17.8,
        strength: 'STRONG',
      },
      roc: 5.2,
      atr14: 18.5,
      bollingerBands: {
        upper: 995.0,
        middle: 960.0,
        lower: 925.0,
        bandwidth: 7.29,
        percentB: 0.85,
      },
      avgVolume20: 6140000,
      volumeRatio: 1.45,
      obv: 24500000,
      volumeBreakout: false,
      fiftyTwoWeekHigh: 1065.0,
      fiftyTwoWeekLow: 610.0,
      distFrom52wHigh: -7.56,
      distFrom52wLow: 61.39,
      nearestSupport: 960.0,
      nearestResistance: 1010.0,
      supportStrength: 8,
      resistanceStrength: 7,
    },
    patterns: [
      {
        pattern: 'Double Bottom Continuation',
        direction: 'BULLISH',
        confidence: 'HIGH',
        confidenceScore: 81,
        detected_at: new Date().toISOString(),
        support: 938.0,
        resistance: 1010.0,
        description: 'Neckline test following double bottom formation in auto rally',
      },
    ],
    nifty: DEFAULT_NIFTY,
    sector_conf: DEFAULT_SECTORS[3],
    data_status: 'FRESH',
    timeframe: 'daily',
    last_updated: new Date().toISOString(),
    isHolding: true,
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd.',
    sector: 'Telecommunications',
    series: 'EQ',
    marketCapCategory: 'Large Cap',
    price: 1682.4,
    change: 18.2,
    changePercent: 1.09,
    volume: 3800000,
    score: 79,
    signal: 'BULLISH',
    confidence: 'HIGH',
    primary_signal: 'Sustained Telecom Leadership & Multi-Month Uptrend',
    secondary_signals: [
      'Price holding firmly above 20 EMA at ₹1,640',
      'Consistent accumulation on shallow pullbacks',
    ],
    score_breakdown: {
      trend: 22,
      maxTrend: 25,
      momentum: 19,
      maxMomentum: 25,
      volume: 16,
      maxVolume: 20,
      pattern: 12,
      maxPattern: 15,
      market: 5,
      maxMarket: 5,
      sector: 5,
      maxSector: 5,
      risk: 0,
      maxRisk: 5,
    },
    breakdown: {
      trend: 22,
      maxTrend: 25,
      momentum: 19,
      maxMomentum: 25,
      volume: 16,
      maxVolume: 20,
      pattern: 12,
      maxPattern: 15,
      market: 5,
      maxMarket: 5,
      sector: 5,
      maxSector: 5,
      risk: 0,
      maxRisk: 5,
    },
    indicators: {
      ema20: 1642.0,
      ema50: 1595.0,
      ema100: 1510.0,
      ema200: 1390.0,
      sma50: 1590.0,
      sma200: 1385.0,
      priceVsEma20: 2.46,
      priceVsEma50: 5.48,
      priceVsEma200: 21.04,
      ema20VsEma50: 2.95,
      ema50VsEma200: 14.75,
      trendDirection: 'BULLISH',
      rsi14: 63.4,
      macd: {
        line: 24.1,
        signal: 19.8,
        histogram: 4.3,
        crossover: 'BULLISH',
      },
      adx14: {
        adx: 31.0,
        plusDI: 33.2,
        minusDI: 15.6,
        strength: 'STRONG',
      },
      roc: 4.1,
      atr14: 26.0,
      bollingerBands: {
        upper: 1705.0,
        middle: 1642.0,
        lower: 1580.0,
        bandwidth: 7.61,
        percentB: 0.82,
      },
      avgVolume20: 3100000,
      volumeRatio: 1.23,
      obv: 29000000,
      volumeBreakout: false,
      fiftyTwoWeekHigh: 1695.0,
      fiftyTwoWeekLow: 910.0,
      distFrom52wHigh: -0.74,
      distFrom52wLow: 84.88,
      nearestSupport: 1642.0,
      nearestResistance: 1700.0,
      supportStrength: 8,
      resistanceStrength: 7,
    },
    patterns: [
      {
        pattern: 'High-Tight Flag Continuation',
        direction: 'BULLISH',
        confidence: 'HIGH',
        confidenceScore: 83,
        detected_at: new Date().toISOString(),
        support: 1642.0,
        resistance: 1695.0,
        description: 'Tight range near all-time highs displaying resilience',
      },
    ],
    nifty: DEFAULT_NIFTY,
    sector_conf: DEFAULT_SECTORS[7],
    data_status: 'FRESH',
    timeframe: 'daily',
    last_updated: new Date().toISOString(),
    isWatchlist: true,
  },
  {
    symbol: 'INFY',
    name: 'Infosys Ltd.',
    sector: 'Information Technology',
    series: 'EQ',
    marketCapCategory: 'Large Cap',
    price: 1892.4,
    change: 14.5,
    changePercent: 0.77,
    volume: 4200000,
    score: 77,
    signal: 'BULLISH',
    confidence: 'MEDIUM',
    primary_signal: 'IT Sector Bullish Trend Alignment above 20 EMA',
    secondary_signals: [
      'RSI 59 in healthy accumulation zone',
      'Support established at ₹1,850 previous breakout line',
    ],
    score_breakdown: {
      trend: 21,
      maxTrend: 25,
      momentum: 19,
      maxMomentum: 25,
      volume: 15,
      maxVolume: 20,
      pattern: 12,
      maxPattern: 15,
      market: 5,
      maxMarket: 5,
      sector: 5,
      maxSector: 5,
      risk: 0,
      maxRisk: 5,
    },
    breakdown: {
      trend: 21,
      maxTrend: 25,
      momentum: 19,
      maxMomentum: 25,
      volume: 15,
      maxVolume: 20,
      pattern: 12,
      maxPattern: 15,
      market: 5,
      maxMarket: 5,
      sector: 5,
      maxSector: 5,
      risk: 0,
      maxRisk: 5,
    },
    indicators: {
      ema20: 1855.0,
      ema50: 1810.0,
      ema100: 1720.0,
      ema200: 1610.0,
      sma50: 1805.0,
      sma200: 1605.0,
      priceVsEma20: 2.02,
      priceVsEma50: 4.55,
      priceVsEma200: 17.54,
      ema20VsEma50: 2.49,
      ema50VsEma200: 12.42,
      trendDirection: 'BULLISH',
      rsi14: 59.5,
      macd: {
        line: 22.5,
        signal: 18.0,
        histogram: 4.5,
        crossover: 'BULLISH',
      },
      adx14: {
        adx: 26.2,
        plusDI: 29.1,
        minusDI: 18.3,
        strength: 'STRONG',
      },
      roc: 3.5,
      atr14: 32.0,
      bollingerBands: {
        upper: 1920.0,
        middle: 1855.0,
        lower: 1790.0,
        bandwidth: 7.01,
        percentB: 0.79,
      },
      avgVolume20: 3600000,
      volumeRatio: 1.17,
      obv: 35000000,
      volumeBreakout: false,
      fiftyTwoWeekHigh: 1940.0,
      fiftyTwoWeekLow: 1350.0,
      distFrom52wHigh: -2.45,
      distFrom52wLow: 40.18,
      nearestSupport: 1850.0,
      nearestResistance: 1930.0,
      supportStrength: 8,
      resistanceStrength: 7,
    },
    patterns: [
      {
        pattern: 'Ascending Channel Continuation',
        direction: 'BULLISH',
        confidence: 'MEDIUM',
        confidenceScore: 78,
        detected_at: new Date().toISOString(),
        support: 1850.0,
        resistance: 1930.0,
        description: 'Price riding upper half of ascending daily trend channel',
      },
    ],
    nifty: DEFAULT_NIFTY,
    sector_conf: DEFAULT_SECTORS[1],
    data_status: 'FRESH',
    timeframe: 'daily',
    last_updated: new Date().toISOString(),
    isHolding: true,
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    sector: 'Information Technology',
    series: 'EQ',
    marketCapCategory: 'Large Cap',
    price: 4245.8,
    change: -18.0,
    changePercent: -0.42,
    volume: 1650000,
    score: 75,
    signal: 'BULLISH',
    confidence: 'MEDIUM',
    primary_signal: 'Consolidation at Highs with Strong Long-term EMAs',
    secondary_signals: [
      'Healthy pullback to 20 EMA on low volume',
      'Solid long-term base above ₹4,000 psychological support',
    ],
    score_breakdown: {
      trend: 20,
      maxTrend: 25,
      momentum: 18,
      maxMomentum: 25,
      volume: 15,
      maxVolume: 20,
      pattern: 12,
      maxPattern: 15,
      market: 5,
      maxMarket: 5,
      sector: 5,
      maxSector: 5,
      risk: 0,
      maxRisk: 5,
    },
    breakdown: {
      trend: 20,
      maxTrend: 25,
      momentum: 18,
      maxMomentum: 25,
      volume: 15,
      maxVolume: 20,
      pattern: 12,
      maxPattern: 15,
      market: 5,
      maxMarket: 5,
      sector: 5,
      maxSector: 5,
      risk: 0,
      maxRisk: 5,
    },
    indicators: {
      ema20: 4230.0,
      ema50: 4150.0,
      ema100: 4010.0,
      ema200: 3880.0,
      sma50: 4140.0,
      sma200: 3875.0,
      priceVsEma20: 0.37,
      priceVsEma50: 2.31,
      priceVsEma200: 9.43,
      ema20VsEma50: 1.93,
      ema50VsEma200: 6.96,
      trendDirection: 'BULLISH',
      rsi14: 55.4,
      macd: {
        line: 38.2,
        signal: 35.1,
        histogram: 3.1,
        crossover: 'BULLISH',
      },
      adx14: {
        adx: 23.4,
        plusDI: 26.5,
        minusDI: 20.1,
        strength: 'MODERATE',
      },
      roc: 1.8,
      atr14: 64.0,
      bollingerBands: {
        upper: 4320.0,
        middle: 4230.0,
        lower: 4140.0,
        bandwidth: 4.26,
        percentB: 0.59,
      },
      avgVolume20: 1850000,
      volumeRatio: 0.89,
      obv: 21000000,
      volumeBreakout: false,
      fiftyTwoWeekHigh: 4420.0,
      fiftyTwoWeekLow: 3310.0,
      distFrom52wHigh: -3.94,
      distFrom52wLow: 28.27,
      nearestSupport: 4180.0,
      nearestResistance: 4350.0,
      supportStrength: 9,
      resistanceStrength: 8,
    },
    patterns: [
      {
        pattern: 'Bullish Flag Range',
        direction: 'BULLISH',
        confidence: 'MEDIUM',
        confidenceScore: 76,
        detected_at: new Date().toISOString(),
        support: 4180.0,
        resistance: 4350.0,
        description: 'Tight range contracting volatility before next trend expansion',
      },
    ],
    nifty: DEFAULT_NIFTY,
    sector_conf: DEFAULT_SECTORS[1],
    data_status: 'FRESH',
    timeframe: 'daily',
    last_updated: new Date().toISOString(),
    isHolding: true,
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    sector: 'Banking & Financials',
    series: 'EQ',
    marketCapCategory: 'Large Cap',
    price: 1685.2,
    change: 16.5,
    changePercent: 0.99,
    volume: 14200000,
    score: 76,
    signal: 'BULLISH',
    confidence: 'HIGH',
    primary_signal: 'Banking Giant Golden Cross with Accumulation Volume',
    secondary_signals: [
      '50 EMA crossing 200 EMA golden cross confirmed',
      'Holding above major structural support at ₹1,640',
    ],
    score_breakdown: {
      trend: 21,
      maxTrend: 25,
      momentum: 19,
      maxMomentum: 25,
      volume: 16,
      maxVolume: 20,
      pattern: 11,
      maxPattern: 15,
      market: 5,
      maxMarket: 5,
      sector: 4,
      maxSector: 5,
      risk: 0,
      maxRisk: 5,
    },
    breakdown: {
      trend: 21,
      maxTrend: 25,
      momentum: 19,
      maxMomentum: 25,
      volume: 16,
      maxVolume: 20,
      pattern: 11,
      maxPattern: 15,
      market: 5,
      maxMarket: 5,
      sector: 4,
      maxSector: 5,
      risk: 0,
      maxRisk: 5,
    },
    indicators: {
      ema20: 1660.0,
      ema50: 1640.0,
      ema100: 1600.0,
      ema200: 1575.0,
      sma50: 1638.0,
      sma200: 1570.0,
      priceVsEma20: 1.52,
      priceVsEma50: 2.76,
      priceVsEma200: 7.0,
      ema20VsEma50: 1.22,
      ema50VsEma200: 4.13,
      trendDirection: 'BULLISH',
      rsi14: 57.8,
      macd: {
        line: 15.2,
        signal: 12.1,
        histogram: 3.1,
        crossover: 'BULLISH',
      },
      adx14: {
        adx: 25.1,
        plusDI: 28.3,
        minusDI: 19.2,
        strength: 'MODERATE',
      },
      roc: 2.6,
      atr14: 24.5,
      bollingerBands: {
        upper: 1715.0,
        middle: 1660.0,
        lower: 1605.0,
        bandwidth: 6.63,
        percentB: 0.73,
      },
      avgVolume20: 11800000,
      volumeRatio: 1.2,
      obv: 62000000,
      volumeBreakout: false,
      fiftyTwoWeekHigh: 1794.0,
      fiftyTwoWeekLow: 1363.0,
      distFrom52wHigh: -6.06,
      distFrom52wLow: 23.64,
      nearestSupport: 1640.0,
      nearestResistance: 1720.0,
      supportStrength: 9,
      resistanceStrength: 8,
    },
    patterns: [
      {
        pattern: 'Golden Cross (50/200 EMA)',
        direction: 'BULLISH',
        confidence: 'HIGH',
        confidenceScore: 84,
        detected_at: new Date().toISOString(),
        support: 1640.0,
        resistance: 1720.0,
        description: 'Golden Cross breakout signaling multi-quarter trend reversal',
      },
    ],
    nifty: DEFAULT_NIFTY,
    sector_conf: DEFAULT_SECTORS[2],
    data_status: 'FRESH',
    timeframe: 'daily',
    last_updated: new Date().toISOString(),
    isHolding: true,
  },
  {
    symbol: 'LT',
    name: 'Larsen & Toubro Ltd.',
    sector: 'Infrastructure',
    series: 'EQ',
    marketCapCategory: 'Large Cap',
    price: 3580.0,
    change: -12.4,
    changePercent: -0.35,
    volume: 1800000,
    score: 73,
    signal: 'BULLISH',
    confidence: 'MEDIUM',
    primary_signal: 'Infrastructure Multi-Year Uptrend & Support Test',
    secondary_signals: [
      'Holding 50 EMA at ₹3,520 with solid institutional sponsorship',
    ],
    score_breakdown: {
      trend: 20,
      maxTrend: 25,
      momentum: 17,
      maxMomentum: 25,
      volume: 14,
      maxVolume: 20,
      pattern: 11,
      maxPattern: 15,
      market: 5,
      maxMarket: 5,
      sector: 4,
      maxSector: 5,
      risk: 0,
      maxRisk: 5,
    },
    breakdown: {
      trend: 20,
      maxTrend: 25,
      momentum: 17,
      maxMomentum: 25,
      volume: 14,
      maxVolume: 20,
      pattern: 11,
      maxPattern: 15,
      market: 5,
      maxMarket: 5,
      sector: 4,
      maxSector: 5,
      risk: 0,
      maxRisk: 5,
    },
    indicators: {
      ema20: 3590.0,
      ema50: 3520.0,
      ema100: 3400.0,
      ema200: 3210.0,
      sma50: 3515.0,
      sma200: 3205.0,
      priceVsEma20: -0.28,
      priceVsEma50: 1.7,
      priceVsEma200: 11.53,
      ema20VsEma50: 1.99,
      ema50VsEma200: 9.66,
      trendDirection: 'BULLISH',
      rsi14: 52.1,
      macd: {
        line: 18.4,
        signal: 21.0,
        histogram: -2.6,
        crossover: 'NONE',
      },
      adx14: {
        adx: 21.4,
        plusDI: 24.1,
        minusDI: 21.8,
        strength: 'MODERATE',
      },
      roc: 1.2,
      atr14: 55.0,
      bollingerBands: {
        upper: 3690.0,
        middle: 3590.0,
        lower: 3490.0,
        bandwidth: 5.57,
        percentB: 0.45,
      },
      avgVolume20: 1950000,
      volumeRatio: 0.92,
      obv: 14200000,
      volumeBreakout: false,
      fiftyTwoWeekHigh: 3919.9,
      fiftyTwoWeekLow: 2840.0,
      distFrom52wHigh: -8.67,
      distFrom52wLow: 26.06,
      nearestSupport: 3520.0,
      nearestResistance: 3700.0,
      supportStrength: 8,
      resistanceStrength: 8,
    },
    patterns: [],
    nifty: DEFAULT_NIFTY,
    sector_conf: DEFAULT_SECTORS[7],
    data_status: 'FRESH',
    timeframe: 'daily',
    last_updated: new Date().toISOString(),
    isWatchlist: true,
  },
];

// Helper summary calculation
export function calculateSummary(results: StockScanResult[]): ScannerSummary {
  const strongBullish = results.filter((r) => r.signal === 'STRONG BULLISH').length;
  const bullish = results.filter((r) => r.signal === 'BULLISH').length;
  const bearish = results.filter((r) => r.signal === 'BEARISH').length;
  const strongBearish = results.filter((r) => r.signal === 'STRONG BEARISH').length;
  const neutral = results.filter((r) => r.signal === 'NEUTRAL').length;
  const breakouts = results.filter((r) =>
    r.patterns.some((p) => p.pattern.toLowerCase().includes('breakout'))
  ).length;

  return {
    totalScanned: results.length,
    strongBullishCount: strongBullish,
    bullishCount: bullish,
    neutralCount: neutral,
    bearishCount: bearish,
    strongBearishCount: strongBearish,
    breakoutCount: breakouts,
    marketBreadth: {
      advancing: strongBullish + bullish,
      declining: strongBearish + bearish,
      unchanged: neutral,
    },
    scanTimestamp: new Date().toISOString(),
    scannedAt: new Date().toLocaleTimeString(),
  };
}

// Generate deterministic historical OHLCV candles for stock detail chart
export function generateCandlesForStock(stock: StockScanResult, count = 60): OHLCV[] {
  const candles: OHLCV[] = [];
  const currentPrice = stock.price;
  const dailyVol = (stock.indicators?.atr14 || currentPrice * 0.015) / currentPrice;
  const now = Date.now();
  const dayMs = 86400000;

  let price = currentPrice * 0.88; // 60 days ago
  const dailyDrift = (currentPrice - price) / count;

  for (let i = count; i >= 0; i--) {
    const timestamp = now - i * dayMs;
    const dateStr = new Date(timestamp).toISOString().split('T')[0];

    // pseudo-random but stable walk
    const seed = Math.sin(timestamp + stock.symbol.charCodeAt(0)) * 10000;
    const rnd = seed - Math.floor(seed);
    const change = (rnd - 0.48) * dailyVol * price + dailyDrift;

    const open = Math.round(price * 100) / 100;
    price += change;
    if (i === 0) price = currentPrice; // lock latest candle to actual price
    const close = Math.round(price * 100) / 100;

    const high = Math.round(Math.max(open, close) * (1 + Math.abs(rnd * 0.008)) * 100) / 100;
    const low = Math.round(Math.min(open, close) * (1 - Math.abs((1 - rnd) * 0.008)) * 100) / 100;
    const volume = Math.round(
      (stock.indicators?.avgVolume20 || 1000000) * (0.6 + rnd * 0.8)
    );

    candles.push({
      timestamp,
      dateStr,
      open,
      high,
      low,
      close,
      volume,
    });
  }

  return candles;
}

// Storage Service API
export const StorageService = {
  // Holdings
  getHoldings(): Holding[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HOLDINGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[StorageService] Error reading holdings', e);
    }
    // Seed default holdings if none
    this.saveHoldings(DEFAULT_HOLDINGS);
    return DEFAULT_HOLDINGS;
  },

  saveHoldings(holdings: Holding[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HOLDINGS, JSON.stringify(holdings));
    } catch (e) {
      console.error('[StorageService] Error saving holdings', e);
    }
  },

  addHolding(item: { symbol: string; name: string; sector: string; quantity: number; avgPrice: number; currentPrice: number }): Holding[] {
    const current = this.getHoldings();
    const existingIndex = current.findIndex((h) => h.symbol === item.symbol);
    const invested = item.quantity * item.avgPrice;
    const currentValue = item.quantity * item.currentPrice;
    const pnl = currentValue - invested;
    const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;

    if (existingIndex >= 0) {
      // average in
      const existing = current[existingIndex];
      const newQty = existing.quantity + item.quantity;
      const newInvested = existing.invested + invested;
      const newAvg = newQty > 0 ? newInvested / newQty : item.avgPrice;
      const newCurrVal = newQty * item.currentPrice;
      const newPnl = newCurrVal - newInvested;

      current[existingIndex] = {
        ...existing,
        quantity: newQty,
        avgPrice: Math.round(newAvg * 100) / 100,
        currentPrice: item.currentPrice,
        invested: Math.round(newInvested * 100) / 100,
        currentValue: Math.round(newCurrVal * 100) / 100,
        pnl: Math.round(newPnl * 100) / 100,
        pnlPercent: Math.round((newPnl / newInvested) * 10000) / 100,
        updatedAt: new Date().toISOString(),
      };
    } else {
      const newHolding: Holding = {
        id: `hold-${Date.now()}`,
        symbol: item.symbol,
        name: item.name,
        sector: item.sector,
        quantity: item.quantity,
        avgPrice: item.avgPrice,
        currentPrice: item.currentPrice,
        invested: Math.round(invested * 100) / 100,
        currentValue: Math.round(currentValue * 100) / 100,
        pnl: Math.round(pnl * 100) / 100,
        pnlPercent: Math.round(pnlPercent * 100) / 100,
        dayGain: Math.round(item.quantity * (item.currentPrice * 0.005) * 100) / 100,
        dayGainPercent: 0.5,
        updatedAt: new Date().toISOString(),
      };
      current.push(newHolding);
    }
    this.saveHoldings(current);
    return current;
  },

  deleteHolding(id: string): Holding[] {
    const current = this.getHoldings().filter((h) => h.id !== id && h.symbol !== id);
    this.saveHoldings(current);
    return current;
  },

  // Watchlist
  getWatchlist(): WatchlistItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[StorageService] Error reading watchlist', e);
    }
    this.saveWatchlist(DEFAULT_WATCHLIST);
    return DEFAULT_WATCHLIST;
  },

  saveWatchlist(list: WatchlistItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(list));
    } catch (e) {
      console.error('[StorageService] Error saving watchlist', e);
    }
  },

  addToWatchlist(item: { symbol: string; name: string; sector: string; notes?: string; price?: number; change?: number; changePercent?: number }): WatchlistItem[] {
    const list = this.getWatchlist();
    if (list.some((w) => w.symbol === item.symbol)) return list;

    const newItem: WatchlistItem = {
      symbol: item.symbol,
      name: item.name,
      sector: item.sector,
      price: item.price ?? 1000,
      change: item.change ?? 10,
      changePercent: item.changePercent ?? 1.0,
      addedAt: new Date().toISOString(),
      notes: item.notes,
    };
    const updated = [newItem, ...list];
    this.saveWatchlist(updated);
    return updated;
  },

  removeFromWatchlist(symbol: string): WatchlistItem[] {
    const list = this.getWatchlist().filter((w) => w.symbol !== symbol);
    this.saveWatchlist(list);
    return list;
  },

  // Alerts
  getAlerts(): AlertRule[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ALERTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[StorageService] Error reading alerts', e);
    }
    this.saveAlerts(DEFAULT_ALERTS);
    return DEFAULT_ALERTS;
  },

  saveAlerts(alerts: AlertRule[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    } catch (e) {
      console.error('[StorageService] Error saving alerts', e);
    }
  },

  addAlert(rule: Omit<AlertRule, 'id' | 'createdAt'>): AlertRule[] {
    const alerts = this.getAlerts();
    const newRule: AlertRule = {
      ...rule,
      id: `alert-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newRule, ...alerts];
    this.saveAlerts(updated);
    return updated;
  },

  toggleAlert(id: string): AlertRule[] {
    const alerts = this.getAlerts().map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a));
    this.saveAlerts(alerts);
    return alerts;
  },

  deleteAlert(id: string): AlertRule[] {
    const alerts = this.getAlerts().filter((a) => a.id !== id);
    this.saveAlerts(alerts);
    return alerts;
  },

  // Cached Scans & Fallback
  getCachedScan(): { results: StockScanResult[]; summary: ScannerSummary } {
    try {
      const storedResults = localStorage.getItem(STORAGE_KEYS.CACHED_SCAN);
      const storedSummary = localStorage.getItem(STORAGE_KEYS.CACHED_SUMMARY);
      if (storedResults) {
        const results = JSON.parse(storedResults);
        if (Array.isArray(results) && results.length > 0) {
          const summary = storedSummary ? JSON.parse(storedSummary) : calculateSummary(results);
          return { results, summary };
        }
      }
    } catch (e) {
      console.warn('[StorageService] Error reading cached scan', e);
    }
    // Default fallback
    const summary = calculateSummary(DEFAULT_SCAN_RESULTS);
    this.saveCachedScan(DEFAULT_SCAN_RESULTS, summary);
    return { results: DEFAULT_SCAN_RESULTS, summary };
  },

  saveCachedScan(results: StockScanResult[], summary?: ScannerSummary | null): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CACHED_SCAN, JSON.stringify(results));
      if (summary) {
        localStorage.setItem(STORAGE_KEYS.CACHED_SUMMARY, JSON.stringify(summary));
      }
    } catch (e) {
      console.error('[StorageService] Error saving cached scan', e);
    }
  },

  // Nifty & Sectors
  getMacroData(): { nifty: NiftyMarketConfirmation; sectors: SectorConfirmation[] } {
    try {
      const storedNifty = localStorage.getItem(STORAGE_KEYS.CACHED_NIFTY);
      const storedSectors = localStorage.getItem(STORAGE_KEYS.CACHED_SECTORS);
      if (storedNifty && storedSectors) {
        return {
          nifty: JSON.parse(storedNifty),
          sectors: JSON.parse(storedSectors),
        };
      }
    } catch (e) {
      console.warn('[StorageService] Error reading macro data', e);
    }
    this.saveMacroData(DEFAULT_NIFTY, DEFAULT_SECTORS);
    return { nifty: DEFAULT_NIFTY, sectors: DEFAULT_SECTORS };
  },

  saveMacroData(nifty: NiftyMarketConfirmation, sectors: SectorConfirmation[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CACHED_NIFTY, JSON.stringify(nifty));
      localStorage.setItem(STORAGE_KEYS.CACHED_SECTORS, JSON.stringify(sectors));
    } catch (e) {
      console.error('[StorageService] Error saving macro data', e);
    }
  },

  // Reset to clean test state
  resetAllToDefaults(): {
    holdings: Holding[];
    watchlist: WatchlistItem[];
    alerts: AlertRule[];
    scanResults: StockScanResult[];
    summary: ScannerSummary;
    nifty: NiftyMarketConfirmation;
    sectors: SectorConfirmation[];
  } {
    this.saveHoldings(DEFAULT_HOLDINGS);
    this.saveWatchlist(DEFAULT_WATCHLIST);
    this.saveAlerts(DEFAULT_ALERTS);
    const summary = calculateSummary(DEFAULT_SCAN_RESULTS);
    this.saveCachedScan(DEFAULT_SCAN_RESULTS, summary);
    this.saveMacroData(DEFAULT_NIFTY, DEFAULT_SECTORS);

    return {
      holdings: DEFAULT_HOLDINGS,
      watchlist: DEFAULT_WATCHLIST,
      alerts: DEFAULT_ALERTS,
      scanResults: DEFAULT_SCAN_RESULTS,
      summary,
      nifty: DEFAULT_NIFTY,
      sectors: DEFAULT_SECTORS,
    };
  },

  // Generate realistic OHLCV candles for stock charts when offline/browser mode
  generateCandlesForStock(symbol: string, currentPrice = 1000, days = 60): OHLCV[] {
    const candles: OHLCV[] = [];
    let price = currentPrice * 0.9;
    const now = Date.now();
    for (let i = days; i >= 0; i--) {
      const timestamp = now - i * 86400000;
      const dateStr = new Date(timestamp).toISOString().split('T')[0];
      const volatility = price * 0.02;
      const change = (Math.sin(i * 0.5) * 0.4 + (Math.random() - 0.48)) * volatility;
      const open = Math.round(price * 10) / 10;
      price = Math.max(10, price + change);
      const close = Math.round(price * 10) / 10;
      const high = Math.round((Math.max(open, close) + Math.random() * volatility) * 10) / 10;
      const low = Math.round((Math.min(open, close) - Math.random() * volatility) * 10) / 10;
      const volume = Math.floor(100000 + Math.random() * 500000);
      candles.push({ timestamp, dateStr, open, high, low, close, volume });
    }
    return candles;
  },

  // Clear user data
  clearAllUserData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.HOLDINGS);
      localStorage.removeItem(STORAGE_KEYS.WATCHLIST);
      localStorage.removeItem(STORAGE_KEYS.ALERTS);
    } catch (e) {
      console.error('[StorageService] Error clearing user data', e);
    }
  },
};
