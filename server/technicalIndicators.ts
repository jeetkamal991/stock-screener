import { OHLCV, TechnicalIndicators } from '../shared/types.ts';

// Helper: Standard Simple Moving Average series
export function calculateSMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(data.length).fill(null);
  if (data.length < period) return result;

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  result[period - 1] = sum / period;

  for (let i = period; i < data.length; i++) {
    sum += data[i] - data[i - period];
    result[i] = sum / period;
  }
  return result;
}

// Helper: Standard Exponential Moving Average series with SMA initialization
export function calculateEMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(data.length).fill(null);
  if (data.length < period) return result;

  // Initialize with SMA of first `period` elements
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  let currentEma = sum / period;
  result[period - 1] = currentEma;

  const multiplier = 2 / (period + 1);

  for (let i = period; i < data.length; i++) {
    currentEma = (data[i] - currentEma) * multiplier + currentEma;
    result[i] = currentEma;
  }

  return result;
}

// Helper: Wilder's RSI (14)
export function calculateRSI(closes: number[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = new Array(closes.length).fill(null);
  if (closes.length <= period) return result;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  if (avgLoss === 0) {
    result[period] = 100;
  } else {
    const rs = avgGain / avgLoss;
    result[period] = 100 - (100 / (1 + rs));
  }

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      result[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      result[i] = 100 - (100 / (1 + rs));
    }
  }

  return result;
}

// Helper: MACD (12, 26, 9)
export function calculateMACD(
  closes: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): {
  macdLine: (number | null)[];
  signalLine: (number | null)[];
  histogram: (number | null)[];
} {
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  const macdLine: (number | null)[] = new Array(closes.length).fill(null);
  const validMacdValues: number[] = [];
  const validIndices: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (fastEMA[i] !== null && slowEMA[i] !== null) {
      const val = fastEMA[i]! - slowEMA[i]!;
      macdLine[i] = val;
      validMacdValues.push(val);
      validIndices.push(i);
    }
  }

  const signalLine: (number | null)[] = new Array(closes.length).fill(null);
  const histogram: (number | null)[] = new Array(closes.length).fill(null);

  if (validMacdValues.length >= signalPeriod) {
    const signalSub = calculateEMA(validMacdValues, signalPeriod);
    for (let k = 0; k < validMacdValues.length; k++) {
      const originalIdx = validIndices[k];
      const sigVal = signalSub[k];
      signalLine[originalIdx] = sigVal;
      if (sigVal !== null && macdLine[originalIdx] !== null) {
        histogram[originalIdx] = macdLine[originalIdx]! - sigVal;
      }
    }
  }

  return { macdLine, signalLine, histogram };
}

// Helper: ADX (14)
export function calculateADX(candles: OHLCV[], period = 14): {
  adx: (number | null)[];
  plusDI: (number | null)[];
  minusDI: (number | null)[];
} {
  const n = candles.length;
  const adxResult: (number | null)[] = new Array(n).fill(null);
  const plusDIResult: (number | null)[] = new Array(n).fill(null);
  const minusDIResult: (number | null)[] = new Array(n).fill(null);

  if (n <= period * 2) {
    return { adx: adxResult, plusDI: plusDIResult, minusDI: minusDIResult };
  }

  const tr: number[] = [candles[0].high - candles[0].low];
  const plusDM: number[] = [0];
  const minusDM: number[] = [0];

  for (let i = 1; i < n; i++) {
    const h = candles[i].high;
    const l = candles[i].low;
    const prevC = candles[i - 1].close;

    const trueRange = Math.max(h - l, Math.abs(h - prevC), Math.abs(l - prevC));
    tr.push(trueRange);

    const upMove = h - candles[i - 1].high;
    const downMove = candles[i - 1].low - l;

    if (upMove > downMove && upMove > 0) {
      plusDM.push(upMove);
    } else {
      plusDM.push(0);
    }

    if (downMove > upMove && downMove > 0) {
      minusDM.push(downMove);
    } else {
      minusDM.push(0);
    }
  }

  // Initial sum for first 14
  let smoothedTR = 0;
  let smoothedPlusDM = 0;
  let smoothedMinusDM = 0;

  for (let i = 0; i < period; i++) {
    smoothedTR += tr[i];
    smoothedPlusDM += plusDM[i];
    smoothedMinusDM += minusDM[i];
  }

  const dxValues: number[] = [];
  const dxIndices: number[] = [];

  for (let i = period; i < n; i++) {
    smoothedTR = smoothedTR - smoothedTR / period + tr[i];
    smoothedPlusDM = smoothedPlusDM - smoothedPlusDM / period + plusDM[i];
    smoothedMinusDM = smoothedMinusDM - smoothedMinusDM / period + minusDM[i];

    const pDI = smoothedTR > 0 ? (smoothedPlusDM / smoothedTR) * 100 : 0;
    const mDI = smoothedTR > 0 ? (smoothedMinusDM / smoothedTR) * 100 : 0;

    plusDIResult[i] = pDI;
    minusDIResult[i] = mDI;

    const diSum = pDI + mDI;
    const dx = diSum > 0 ? (Math.abs(pDI - mDI) / diSum) * 100 : 0;
    dxValues.push(dx);
    dxIndices.push(i);
  }

  if (dxValues.length >= period) {
    let adxSum = 0;
    for (let i = 0; i < period; i++) {
      adxSum += dxValues[i];
    }
    let currentADX = adxSum / period;
    adxResult[dxIndices[period - 1]] = currentADX;

    for (let i = period; i < dxValues.length; i++) {
      currentADX = (currentADX * (period - 1) + dxValues[i]) / period;
      adxResult[dxIndices[i]] = currentADX;
    }
  }

  return { adx: adxResult, plusDI: plusDIResult, minusDI: minusDIResult };
}

// Helper: ATR (14)
export function calculateATR(candles: OHLCV[], period = 14): (number | null)[] {
  const result: (number | null)[] = new Array(candles.length).fill(null);
  if (candles.length < period + 1) return result;

  const tr: number[] = [candles[0].high - candles[0].low];
  for (let i = 1; i < candles.length; i++) {
    const h = candles[i].high;
    const l = candles[i].low;
    const prevC = candles[i - 1].close;
    tr.push(Math.max(h - l, Math.abs(h - prevC), Math.abs(l - prevC)));
  }

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += tr[i];
  }
  let currentATR = sum / period;
  result[period - 1] = currentATR;

  for (let i = period; i < candles.length; i++) {
    currentATR = (currentATR * (period - 1) + tr[i]) / period;
    result[i] = currentATR;
  }

  return result;
}

// Helper: Bollinger Bands (20, 2)
export function calculateBollingerBands(
  closes: number[],
  period = 20,
  stdDevMultiplier = 2
): {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
  bandwidth: (number | null)[];
  percentB: (number | null)[];
} {
  const middle = calculateSMA(closes, period);
  const upper: (number | null)[] = new Array(closes.length).fill(null);
  const lower: (number | null)[] = new Array(closes.length).fill(null);
  const bandwidth: (number | null)[] = new Array(closes.length).fill(null);
  const percentB: (number | null)[] = new Array(closes.length).fill(null);

  for (let i = period - 1; i < closes.length; i++) {
    const mid = middle[i];
    if (mid === null) continue;

    let varianceSum = 0;
    for (let k = i - period + 1; k <= i; k++) {
      varianceSum += Math.pow(closes[k] - mid, 2);
    }
    const stdDev = Math.sqrt(varianceSum / period);

    const u = mid + stdDevMultiplier * stdDev;
    const l = mid - stdDevMultiplier * stdDev;

    upper[i] = u;
    lower[i] = l;
    bandwidth[i] = mid > 0 ? ((u - l) / mid) * 100 : 0;
    percentB[i] = (u - l) > 0 ? (closes[i] - l) / (u - l) : 0.5;
  }

  return { upper, middle, lower, bandwidth, percentB };
}

// Helper: On-Balance Volume (OBV)
export function calculateOBV(candles: OHLCV[]): number[] {
  const obv: number[] = new Array(candles.length).fill(0);
  if (candles.length === 0) return obv;

  obv[0] = candles[0].volume;
  for (let i = 1; i < candles.length; i++) {
    const prevC = candles[i - 1].close;
    const curC = candles[i].close;
    const vol = candles[i].volume;

    if (curC > prevC) {
      obv[i] = obv[i - 1] + vol;
    } else if (curC < prevC) {
      obv[i] = obv[i - 1] - vol;
    } else {
      obv[i] = obv[i - 1];
    }
  }

  return obv;
}

// Helper: Algorithmic Support & Resistance Levels with strength
export function calculateSupportResistance(candles: OHLCV[]): {
  nearestSupport: number;
  nearestResistance: number;
  supportStrength: number;
  resistanceStrength: number;
  allSupports: number[];
  allResistances: number[];
} {
  if (candles.length < 20) {
    const lastClose = candles[candles.length - 1]?.close || 100;
    return {
      nearestSupport: Math.round(lastClose * 0.95 * 100) / 100,
      nearestResistance: Math.round(lastClose * 1.05 * 100) / 100,
      supportStrength: 5,
      resistanceStrength: 5,
      allSupports: [],
      allResistances: [],
    };
  }

  const currentPrice = candles[candles.length - 1].close;
  // Look back over up to 100 candles
  const window = candles.slice(-100);
  const swingHighs: number[] = [];
  const swingLows: number[] = [];

  // Find pivot points (3-candle left and right)
  for (let i = 3; i < window.length - 3; i++) {
    const h = window[i].high;
    const l = window[i].low;

    const isHigh =
      h >= window[i - 1].high &&
      h >= window[i - 2].high &&
      h >= window[i - 3].high &&
      h >= window[i + 1].high &&
      h >= window[i + 2].high &&
      h >= window[i + 3].high;

    const isLow =
      l <= window[i - 1].low &&
      l <= window[i - 2].low &&
      l <= window[i - 3].low &&
      l <= window[i + 1].low &&
      l <= window[i + 2].low &&
      l <= window[i + 3].low;

    if (isHigh) swingHighs.push(h);
    if (isLow) swingLows.push(l);
  }

  // Cluster swing highs (Resistances) within 1.2%
  const clusterLevels = (levels: number[]) => {
    levels.sort((a, b) => a - b);
    const clusters: Array<{ price: number; touches: number }> = [];

    for (const lvl of levels) {
      let merged = false;
      for (const c of clusters) {
        if (Math.abs(c.price - lvl) / c.price <= 0.015) {
          c.price = (c.price * c.touches + lvl) / (c.touches + 1);
          c.touches += 1;
          merged = true;
          break;
        }
      }
      if (!merged) {
        clusters.push({ price: lvl, touches: 1 });
      }
    }
    return clusters;
  };

  const resistanceClusters = clusterLevels(swingHighs);
  const supportClusters = clusterLevels(swingLows);

  // Resistances strictly above current price
  const validResistances = resistanceClusters
    .filter((c) => c.price > currentPrice * 1.002)
    .sort((a, b) => a.price - b.price);

  // Supports strictly below current price
  const validSupports = supportClusters
    .filter((c) => c.price < currentPrice * 0.998)
    .sort((a, b) => b.price - a.price);

  const nearestRes = validResistances[0] || {
    price: Math.round(currentPrice * 1.05 * 100) / 100,
    touches: 2,
  };

  const nearestSup = validSupports[0] || {
    price: Math.round(currentPrice * 0.95 * 100) / 100,
    touches: 2,
  };

  const supportStrength = Math.min(10, Math.max(3, nearestSup.touches * 2 + 1));
  const resistanceStrength = Math.min(10, Math.max(3, nearestRes.touches * 2 + 1));

  return {
    nearestSupport: Math.round(nearestSup.price * 100) / 100,
    nearestResistance: Math.round(nearestRes.price * 100) / 100,
    supportStrength,
    resistanceStrength,
    allSupports: validSupports.map((s) => Math.round(s.price * 100) / 100),
    allResistances: validResistances.map((r) => Math.round(r.price * 100) / 100),
  };
}

// Master Technical Analysis Calculator
export function calculateAllTechnicalIndicators(candles: OHLCV[]): TechnicalIndicators | null {
  if (!candles || candles.length < 30) {
    return null;
  }

  const closes = candles.map((c) => c.close);
  const volumes = candles.map((c) => c.volume);
  const lastIdx = candles.length - 1;
  const currentPrice = closes[lastIdx];

  // Moving Averages
  const ema20Arr = calculateEMA(closes, 20);
  const ema50Arr = calculateEMA(closes, 50);
  const ema100Arr = calculateEMA(closes, 100);
  const ema200Arr = calculateEMA(closes, 200);
  const sma50Arr = calculateSMA(closes, 50);
  const sma200Arr = calculateSMA(closes, 200);

  const ema20 = ema20Arr[lastIdx] ?? currentPrice;
  const ema50 = ema50Arr[lastIdx] ?? ema20;
  const ema100 = ema100Arr[lastIdx] ?? ema50;
  const ema200 = ema200Arr[lastIdx] ?? ema100;
  const sma50 = sma50Arr[lastIdx] ?? ema50;
  const sma200 = sma200Arr[lastIdx] ?? ema200;

  const priceVsEma20 = Math.round(((currentPrice - ema20) / ema20) * 10000) / 100;
  const priceVsEma50 = Math.round(((currentPrice - ema50) / ema50) * 10000) / 100;
  const priceVsEma200 = Math.round(((currentPrice - ema200) / ema200) * 10000) / 100;
  const ema20VsEma50 = Math.round(((ema20 - ema50) / ema50) * 10000) / 100;
  const ema50VsEma200 = Math.round(((ema50 - ema200) / ema200) * 10000) / 100;

  let trendDirection: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  if (currentPrice > ema20 && ema20 > ema50 && ema50 > ema200) {
    trendDirection = 'BULLISH';
  } else if (currentPrice < ema20 && ema20 < ema50 && ema50 < ema200) {
    trendDirection = 'BEARISH';
  } else if (currentPrice > ema50) {
    trendDirection = 'BULLISH';
  } else if (currentPrice < ema50) {
    trendDirection = 'BEARISH';
  }

  // Momentum - RSI
  const rsiArr = calculateRSI(closes, 14);
  const rsi14 = Math.round((rsiArr[lastIdx] ?? 50) * 10) / 10;

  // Momentum - MACD
  const { macdLine, signalLine, histogram } = calculateMACD(closes, 12, 26, 9);
  const curMacd = macdLine[lastIdx] ?? 0;
  const curSig = signalLine[lastIdx] ?? 0;
  const curHist = histogram[lastIdx] ?? 0;
  const prevHist = histogram[lastIdx - 1] ?? 0;

  let macdCross: 'BULLISH' | 'BEARISH' | 'NONE' = 'NONE';
  if (prevHist <= 0 && curHist > 0) macdCross = 'BULLISH';
  else if (prevHist >= 0 && curHist < 0) macdCross = 'BEARISH';

  // Momentum - ADX
  const { adx, plusDI, minusDI } = calculateADX(candles, 14);
  const curADX = Math.round((adx[lastIdx] ?? 20) * 10) / 10;
  const curPlusDI = Math.round((plusDI[lastIdx] ?? 20) * 10) / 10;
  const curMinusDI = Math.round((minusDI[lastIdx] ?? 20) * 10) / 10;

  let adxStrength: 'STRONG' | 'MODERATE' | 'WEAK' = 'WEAK';
  if (curADX >= 25) adxStrength = 'STRONG';
  else if (curADX >= 20) adxStrength = 'MODERATE';

  // Rate of change (14 periods)
  const pastClose14 = closes[Math.max(0, lastIdx - 14)];
  const roc = pastClose14 > 0 ? Math.round(((currentPrice - pastClose14) / pastClose14) * 10000) / 100 : 0;

  // Volatility - ATR
  const atrArr = calculateATR(candles, 14);
  const atr14 = Math.round((atrArr[lastIdx] ?? (currentPrice * 0.02)) * 100) / 100;

  // Volatility - Bollinger Bands
  const bb = calculateBollingerBands(closes, 20, 2);
  const bbUpper = Math.round((bb.upper[lastIdx] ?? currentPrice * 1.05) * 100) / 100;
  const bbMiddle = Math.round((bb.middle[lastIdx] ?? currentPrice) * 100) / 100;
  const bbLower = Math.round((bb.lower[lastIdx] ?? currentPrice * 0.95) * 100) / 100;
  const bbBandwidth = Math.round((bb.bandwidth[lastIdx] ?? 5) * 100) / 100;
  const bbPercentB = Math.round((bb.percentB[lastIdx] ?? 0.5) * 100) / 100;

  // Volume
  const volSMA = calculateSMA(volumes, 20);
  const avgVolume20 = Math.round(volSMA[lastIdx] ?? (volumes[lastIdx] || 100000));
  const currentVolume = volumes[lastIdx] || 1;
  const volumeRatio = avgVolume20 > 0 ? Math.round((currentVolume / avgVolume20) * 100) / 100 : 1;
  const volumeBreakout = volumeRatio >= 2.0;

  const obvArr = calculateOBV(candles);
  const obv = obvArr[lastIdx] ?? 0;

  // 52-Week High and Low
  // 52 weeks is ~250 trading days
  const yearCandles = candles.slice(-250);
  let fiftyTwoWeekHigh = yearCandles[0].high;
  let fiftyTwoWeekLow = yearCandles[0].low;

  for (const c of yearCandles) {
    if (c.high > fiftyTwoWeekHigh) fiftyTwoWeekHigh = c.high;
    if (c.low < fiftyTwoWeekLow) fiftyTwoWeekLow = c.low;
  }
  fiftyTwoWeekHigh = Math.round(fiftyTwoWeekHigh * 100) / 100;
  fiftyTwoWeekLow = Math.round(fiftyTwoWeekLow * 100) / 100;

  const distFrom52wHigh = Math.round(((currentPrice - fiftyTwoWeekHigh) / fiftyTwoWeekHigh) * 10000) / 100;
  const distFrom52wLow = Math.round(((currentPrice - fiftyTwoWeekLow) / fiftyTwoWeekLow) * 10000) / 100;

  // Support and Resistance
  const sr = calculateSupportResistance(candles);

  return {
    ema20: Math.round(ema20 * 100) / 100,
    ema50: Math.round(ema50 * 100) / 100,
    ema100: Math.round(ema100 * 100) / 100,
    ema200: Math.round(ema200 * 100) / 100,
    sma50: Math.round(sma50 * 100) / 100,
    sma200: Math.round(sma200 * 100) / 100,
    priceVsEma20,
    priceVsEma50,
    priceVsEma200,
    ema20VsEma50,
    ema50VsEma200,
    trendDirection,

    rsi14,
    macd: {
      line: Math.round(curMacd * 100) / 100,
      signal: Math.round(curSig * 100) / 100,
      histogram: Math.round(curHist * 100) / 100,
      crossover: macdCross,
    },
    adx14: {
      adx: curADX,
      plusDI: curPlusDI,
      minusDI: curMinusDI,
      strength: adxStrength,
    },
    roc,

    atr14,
    bollingerBands: {
      upper: bbUpper,
      middle: bbMiddle,
      lower: bbLower,
      bandwidth: bbBandwidth,
      percentB: bbPercentB,
    },

    avgVolume20,
    volumeRatio,
    obv,
    volumeBreakout,

    fiftyTwoWeekHigh,
    fiftyTwoWeekLow,
    distFrom52wHigh,
    distFrom52wLow,
    nearestSupport: sr.nearestSupport,
    nearestResistance: sr.nearestResistance,
    supportStrength: sr.supportStrength,
    resistanceStrength: sr.resistanceStrength,
  };
}
