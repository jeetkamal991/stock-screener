import type {
  DetectedPattern,
  NiftyMarketConfirmation,
  ScannerSignalType,
  ScannerWeights,
  ScoreBreakdown,
  SectorConfirmation,
  TechnicalIndicators,
} from '../shared/types.ts';

export const DEFAULT_SCANNER_WEIGHTS: ScannerWeights = {
  trend: 20,
  momentum: 20,
  volume: 15,
  pattern: 15,
  market: 10,
  sector: 10,
  risk: 10,
};

export interface ScoringResult {
  score: number; // 0 - 100
  signal: ScannerSignalType;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  primary_signal: string;
  secondary_signals: string[];
  breakdown: ScoreBreakdown;
}

export function calculateStockScore(
  currentPrice: number,
  changePercent: number,
  indicators: TechnicalIndicators,
  patterns: DetectedPattern[],
  nifty: NiftyMarketConfirmation,
  sector: SectorConfirmation,
  weights: ScannerWeights = DEFAULT_SCANNER_WEIGHTS
): ScoringResult {
  // 1. Trend Score (Max: weights.trend, e.g. 20)
  let trendRaw = 0;
  if (currentPrice > indicators.ema20) trendRaw += 0.25;
  if (indicators.ema20 > indicators.ema50) trendRaw += 0.25;
  if (indicators.ema50 > indicators.ema200) trendRaw += 0.25;
  if (currentPrice > indicators.ema50 && indicators.priceVsEma200 > 0) trendRaw += 0.25;
  const trendScore = Math.round(trendRaw * weights.trend * 10) / 10;

  // 2. Momentum Score (Max: weights.momentum, e.g. 20)
  let momRaw = 0;
  // RSI scoring: 55-68 is sweet spot for bullish momentum
  if (indicators.rsi14 >= 55 && indicators.rsi14 <= 70) momRaw += 0.35;
  else if (indicators.rsi14 >= 48 && indicators.rsi14 < 55) momRaw += 0.25;
  else if (indicators.rsi14 > 70 && indicators.rsi14 <= 78) momRaw += 0.2; // strong but extended
  else if (indicators.rsi14 < 35) momRaw += 0.05; // oversold / weak

  // MACD
  if (indicators.macd.histogram > 0) momRaw += 0.25;
  if (indicators.macd.line > indicators.macd.signal) momRaw += 0.15;
  if (indicators.macd.crossover === 'BULLISH') momRaw += 0.1;

  // ADX & ROC
  if (indicators.adx14.adx >= 20 && indicators.adx14.plusDI > indicators.adx14.minusDI) momRaw += 0.15;
  if (indicators.roc > 0) momRaw += 0.15;

  momRaw = Math.min(1.0, momRaw);
  const momentumScore = Math.round(momRaw * weights.momentum * 10) / 10;

  // 3. Volume Score (Max: weights.volume, e.g. 15)
  let volRaw = 0;
  if (indicators.volumeRatio >= 1.0) volRaw += 0.35;
  if (indicators.volumeRatio >= 1.5) volRaw += 0.35;
  if (indicators.volumeRatio >= 2.0) volRaw += 0.15;
  if (changePercent > 0 && indicators.volumeRatio >= 1.2) volRaw += 0.15;
  volRaw = Math.min(1.0, volRaw);
  const volumeScore = Math.round(volRaw * weights.volume * 10) / 10;

  // 4. Pattern Score (Max: weights.pattern, e.g. 15)
  let patRaw = 0.3; // baseline neutral
  const bullishPatterns = patterns.filter((p) => p.direction === 'BULLISH');
  const bearishPatterns = patterns.filter((p) => p.direction === 'BEARISH');

  for (const p of bullishPatterns) {
    if (p.confidence === 'HIGH') patRaw += 0.35;
    else if (p.confidence === 'MEDIUM') patRaw += 0.2;
    else patRaw += 0.1;
  }

  for (const p of bearishPatterns) {
    if (p.confidence === 'HIGH') patRaw -= 0.35;
    else if (p.confidence === 'MEDIUM') patRaw -= 0.2;
    else patRaw -= 0.1;
  }
  patRaw = Math.min(1.0, Math.max(0.0, patRaw));
  const patternScore = Math.round(patRaw * weights.pattern * 10) / 10;

  // 5. Market / NIFTY Confirmation (Max: weights.market, e.g. 10)
  let mktRaw = 0.5;
  if (nifty.trend === 'STRONG BULLISH') mktRaw = 1.0;
  else if (nifty.trend === 'BULLISH') mktRaw = 0.8;
  else if (nifty.trend === 'NEUTRAL') mktRaw = 0.5;
  else if (nifty.trend === 'BEARISH') mktRaw = 0.25;
  else if (nifty.trend === 'STRONG BEARISH') mktRaw = 0.1;
  const marketScore = Math.round(mktRaw * weights.market * 10) / 10;

  // 6. Sector Confirmation (Max: weights.sector, e.g. 10)
  let secRaw = 0.5;
  if (sector.sectorTrend === 'STRONG BULLISH') secRaw += 0.3;
  else if (sector.sectorTrend === 'BULLISH') secRaw += 0.2;
  else if (sector.sectorTrend === 'BEARISH') secRaw -= 0.2;
  else if (sector.sectorTrend === 'STRONG BEARISH') secRaw -= 0.3;

  if (sector.stockRelativeStrengthVsSector > 0.5) secRaw += 0.2;
  else if (sector.stockRelativeStrengthVsSector < -1.0) secRaw -= 0.2;

  secRaw = Math.min(1.0, Math.max(0.0, secRaw));
  const sectorScore = Math.round(secRaw * weights.sector * 10) / 10;

  // 7. Volatility / Risk Adjustment (Max: weights.risk, e.g. 10)
  let riskRaw = 0.8; // healthy baseline
  // Penalize extreme extension from EMA20 (overbought mean-reversion risk)
  if (indicators.priceVsEma20 > 9.0) riskRaw -= 0.35;
  else if (indicators.priceVsEma20 > 5.0) riskRaw -= 0.15;

  // Penalize overbought Bollinger Band position
  if (indicators.bollingerBands.percentB > 1.05) riskRaw -= 0.25;
  // Reward healthy consolidation inside bands
  if (indicators.bollingerBands.percentB >= 0.5 && indicators.bollingerBands.percentB <= 0.85) riskRaw += 0.2;

  riskRaw = Math.min(1.0, Math.max(0.0, riskRaw));
  const riskScore = Math.round(riskRaw * weights.risk * 10) / 10;

  // Total Score (0 - 100)
  let totalScore = Math.round(
    trendScore + momentumScore + volumeScore + patternScore + marketScore + sectorScore + riskScore
  );
  totalScore = Math.min(100, Math.max(0, totalScore));

  // Determine Signal Classification
  let signal: ScannerSignalType;
  if (totalScore >= 80) signal = 'STRONG BULLISH';
  else if (totalScore >= 65) signal = 'BULLISH';
  else if (totalScore >= 50) signal = 'NEUTRAL';
  else if (totalScore >= 35) signal = 'BEARISH';
  else signal = 'STRONG BEARISH';

  // Primary and supporting signals
  let primary_signal = 'Consolidation / Rangebound';
  const secondary_signals: string[] = [];

  if (bullishPatterns.length > 0) {
    primary_signal = bullishPatterns[0].pattern;
  } else if (bearishPatterns.length > 0) {
    primary_signal = bearishPatterns[0].pattern;
  } else if (signal === 'STRONG BULLISH' || signal === 'BULLISH') {
    primary_signal = 'Bullish Trend Continuation';
  } else if (signal === 'BEARISH' || signal === 'STRONG BEARISH') {
    primary_signal = 'Bearish Downward Momentum';
  }

  // Secondary signals
  if (indicators.ema20 > indicators.ema50 && indicators.ema50 > indicators.ema200) {
    secondary_signals.push('Bullish EMA Alignment (20 > 50 > 200)');
  }
  if (indicators.rsi14 >= 55) {
    secondary_signals.push(`RSI Momentum (${indicators.rsi14})`);
  } else if (indicators.rsi14 <= 35) {
    secondary_signals.push(`RSI Oversold / Pressure (${indicators.rsi14})`);
  }
  if (indicators.volumeRatio >= 1.5) {
    secondary_signals.push(`Volume Expansion (${indicators.volumeRatio}x avg)`);
  }
  if (sector.sectorTrend === 'BULLISH' || sector.sectorTrend === 'STRONG BULLISH') {
    secondary_signals.push(`Sector Strength (${sector.sectorName})`);
  }
  if (nifty.trend === 'BULLISH' || nifty.trend === 'STRONG BULLISH') {
    secondary_signals.push('NIFTY 50 Macro Confirmation');
  } else if (nifty.trend === 'BEARISH' || nifty.trend === 'STRONG BEARISH') {
    secondary_signals.push('NIFTY Macro Divergence / Headwind');
  }

  // Confidence assessment
  let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  const isMarketAligned =
    (signal.includes('BULLISH') && nifty.trend.includes('BULLISH')) ||
    (signal.includes('BEARISH') && nifty.trend.includes('BEARISH'));

  if (isMarketAligned && indicators.volumeRatio >= 1.2 && patterns.length > 0) {
    confidence = 'HIGH';
  } else if (!isMarketAligned || indicators.volumeRatio < 0.8) {
    confidence = 'LOW';
  }

  const breakdown: ScoreBreakdown = {
    trend: trendScore,
    maxTrend: weights.trend,
    momentum: momentumScore,
    maxMomentum: weights.momentum,
    volume: volumeScore,
    maxVolume: weights.volume,
    pattern: patternScore,
    maxPattern: weights.pattern,
    market: marketScore,
    maxMarket: weights.market,
    sector: sectorScore,
    maxSector: weights.sector,
    risk: riskScore,
    maxRisk: weights.risk,
  };

  return {
    score: totalScore,
    signal,
    confidence,
    primary_signal,
    secondary_signals,
    breakdown,
  };
}
