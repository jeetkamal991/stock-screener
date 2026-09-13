import type { DetectedPattern, OHLCV, TechnicalIndicators } from '../shared/types.ts';
import { calculateEMA } from './technicalIndicators.ts';

export function detectPatterns(
  candles: OHLCV[],
  indicators: TechnicalIndicators
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const n = candles.length;
  if (n < 20) return patterns;

  const current = candles[n - 1];
  const prev = candles[n - 2];
  const prev2 = candles[n - 3];
  const detectedAt = current.dateStr || new Date(current.timestamp).toISOString().split('T')[0];

  const sup = indicators.nearestSupport;
  const res = indicators.nearestResistance;

  // 1. Breakout above resistance
  if (current.close > res && prev.close <= res) {
    const isVolConfirm = indicators.volumeRatio >= 1.5;
    const conf = isVolConfirm ? 'HIGH' : 'MEDIUM';
    const confScore = isVolConfirm ? 88 : 72;
    patterns.push({
      pattern: 'Resistance Breakout',
      direction: 'BULLISH',
      confidence: conf,
      confidenceScore: confScore,
      detected_at: detectedAt,
      support: sup,
      resistance: res,
      description: `Price decisively closed at ₹${current.close} above key resistance ₹${res}${isVolConfirm ? ` with ${indicators.volumeRatio}x volume expansion` : ''}.`,
    });
  }

  // 2. Breakdown below support
  if (current.close < sup && prev.close >= sup) {
    const isVolConfirm = indicators.volumeRatio >= 1.5;
    const conf = isVolConfirm ? 'HIGH' : 'MEDIUM';
    const confScore = isVolConfirm ? 86 : 70;
    patterns.push({
      pattern: 'Support Breakdown',
      direction: 'BEARISH',
      confidence: conf,
      confidenceScore: confScore,
      detected_at: detectedAt,
      support: sup,
      resistance: res,
      description: `Price broke down below critical support ₹${sup} to ₹${current.close}${isVolConfirm ? ' on heavy selling volume' : ''}.`,
    });
  }

  // 3. 52-Week High Breakout
  if (current.high >= indicators.fiftyTwoWeekHigh * 0.995 && current.close >= indicators.fiftyTwoWeekHigh * 0.99) {
    patterns.push({
      pattern: '52-Week High Breakout',
      direction: 'BULLISH',
      confidence: indicators.volumeRatio >= 1.4 ? 'HIGH' : 'MEDIUM',
      confidenceScore: indicators.volumeRatio >= 1.4 ? 90 : 75,
      detected_at: detectedAt,
      support: sup,
      resistance: indicators.fiftyTwoWeekHigh,
      description: `Trading within 1% of 52-week high ₹${indicators.fiftyTwoWeekHigh}, demonstrating strong institutional demand.`,
    });
  }

  // 4. 52-Week Low Breakdown
  if (current.low <= indicators.fiftyTwoWeekLow * 1.005 && current.close <= indicators.fiftyTwoWeekLow * 1.01) {
    patterns.push({
      pattern: '52-Week Low Breakdown',
      direction: 'BEARISH',
      confidence: 'HIGH',
      confidenceScore: 85,
      detected_at: detectedAt,
      support: indicators.fiftyTwoWeekLow,
      resistance: res,
      description: `Testing or breaching multi-month 52-week low ₹${indicators.fiftyTwoWeekLow}, signaling persistent structural weakness.`,
    });
  }

  // 5. EMA Crossovers
  // Check if EMA20 just crossed EMA50 within last 3 days
  const closes = candles.map((c) => c.close);
  const ema20Arr = calculateEMA(closes, 20);
  const ema50Arr = calculateEMA(closes, 50);
  const ema200Arr = calculateEMA(closes, 200);

  if (ema20Arr[n - 1] && ema50Arr[n - 1] && ema20Arr[n - 2] && ema50Arr[n - 2]) {
    const cur20 = ema20Arr[n - 1]!;
    const cur50 = ema50Arr[n - 1]!;
    const prev20 = ema20Arr[n - 2]!;
    const prev50 = ema50Arr[n - 2]!;

    if (prev20 <= prev50 && cur20 > cur50) {
      patterns.push({
        pattern: 'EMA Bullish Cross (20/50)',
        direction: 'BULLISH',
        confidence: 'HIGH',
        confidenceScore: 84,
        detected_at: detectedAt,
        support: indicators.ema50,
        resistance: res,
        description: `Short-term EMA20 (₹${indicators.ema20}) crossed above intermediate EMA50 (₹${indicators.ema50}), signaling shift to upward momentum.`,
      });
    } else if (prev20 >= prev50 && cur20 < cur50) {
      patterns.push({
        pattern: 'EMA Bearish Cross (20/50)',
        direction: 'BEARISH',
        confidence: 'HIGH',
        confidenceScore: 82,
        detected_at: detectedAt,
        support: sup,
        resistance: indicators.ema50,
        description: `Short-term EMA20 (₹${indicators.ema20}) crossed below EMA50 (₹${indicators.ema50}), indicating deteriorating momentum.`,
      });
    }
  }

  // 6. Major Golden Cross / Death Cross (EMA50 vs EMA200)
  if (ema50Arr[n - 1] && ema200Arr[n - 1] && ema50Arr[n - 2] && ema200Arr[n - 2]) {
    const cur50 = ema50Arr[n - 1]!;
    const cur200 = ema200Arr[n - 1]!;
    const prev50 = ema50Arr[n - 2]!;
    const prev200 = ema200Arr[n - 2]!;

    if (prev50 <= prev200 && cur50 > cur200) {
      patterns.push({
        pattern: 'Golden Cross (50/200)',
        direction: 'BULLISH',
        confidence: 'HIGH',
        confidenceScore: 92,
        detected_at: detectedAt,
        support: indicators.ema200,
        resistance: res,
        description: `Major structural Golden Cross: EMA50 moved above EMA200, representing long-term bull market initiation.`,
      });
    } else if (prev50 >= prev200 && cur50 < cur200) {
      patterns.push({
        pattern: 'Death Cross (50/200)',
        direction: 'BEARISH',
        confidence: 'HIGH',
        confidenceScore: 90,
        detected_at: detectedAt,
        support: sup,
        resistance: indicators.ema200,
        description: `Major structural Death Cross: EMA50 dropped beneath EMA200, confirming macro downtrend.`,
      });
    }
  }

  // 7. MACD Crossovers
  if (indicators.macd.crossover === 'BULLISH') {
    patterns.push({
      pattern: 'Bullish MACD Crossover',
      direction: 'BULLISH',
      confidence: indicators.rsi14 > 45 ? 'HIGH' : 'MEDIUM',
      confidenceScore: 78,
      detected_at: detectedAt,
      support: sup,
      resistance: res,
      description: `MACD line crossed above signal line into positive acceleration with histogram expanding.`,
    });
  } else if (indicators.macd.crossover === 'BEARISH') {
    patterns.push({
      pattern: 'Bearish MACD Crossover',
      direction: 'BEARISH',
      confidence: indicators.rsi14 < 55 ? 'HIGH' : 'MEDIUM',
      confidenceScore: 76,
      detected_at: detectedAt,
      support: sup,
      resistance: res,
      description: `MACD line crossed below signal line, suggesting fading upward velocity.`,
    });
  }

  // 8. Volume Breakout / Heavy Selling
  if (indicators.volumeRatio >= 2.0) {
    if (current.close > prev.close && current.close > current.open) {
      patterns.push({
        pattern: 'High-Volume Breakout',
        direction: 'BULLISH',
        confidence: 'HIGH',
        confidenceScore: 86,
        detected_at: detectedAt,
        support: current.low,
        resistance: res,
        description: `Volume surged to ${indicators.volumeRatio}x 20-day average on strong green close, confirming institutional accumulation.`,
      });
    } else if (current.close < prev.close && current.close < current.open) {
      patterns.push({
        pattern: 'High-Volume Distribution',
        direction: 'BEARISH',
        confidence: 'HIGH',
        confidenceScore: 84,
        detected_at: detectedAt,
        support: sup,
        resistance: current.high,
        description: `Heavy institutional selling with volume at ${indicators.volumeRatio}x 20-day average on a declining session.`,
      });
    }
  }

  // 9. Candlestick Patterns
  const body = Math.abs(current.close - current.open);
  const candleRange = current.high - current.low;
  const upperWick = current.high - Math.max(current.close, current.open);
  const lowerWick = Math.min(current.close, current.open) - current.low;

  // Bullish Hammer: small body near top, long lower wick (>= 2x body), downtrend context
  if (candleRange > 0 && lowerWick >= 2 * body && upperWick <= 0.2 * candleRange && current.close < indicators.ema20) {
    patterns.push({
      pattern: 'Bullish Hammer',
      direction: 'BULLISH',
      confidence: 'MEDIUM',
      confidenceScore: 74,
      detected_at: detectedAt,
      support: current.low,
      resistance: res,
      description: `Bullish hammer formed at ₹${current.low}, displaying rejection of lower prices and intraday buyer absorption.`,
    });
  }

  // Shooting Star: small body near bottom, long upper wick (>= 2x body), uptrend context
  if (candleRange > 0 && upperWick >= 2 * body && lowerWick <= 0.2 * candleRange && current.close > indicators.ema20) {
    patterns.push({
      pattern: 'Shooting Star',
      direction: 'BEARISH',
      confidence: 'MEDIUM',
      confidenceScore: 72,
      detected_at: detectedAt,
      support: sup,
      resistance: current.high,
      description: `Bearish shooting star at ₹${current.high} shows upside rejection after intraday push.`,
    });
  }

  // Bullish Engulfing
  if (prev.close < prev.open && current.close > current.open && current.open <= prev.close && current.close >= prev.open) {
    patterns.push({
      pattern: 'Bullish Engulfing',
      direction: 'BULLISH',
      confidence: indicators.volumeRatio >= 1.2 ? 'HIGH' : 'MEDIUM',
      confidenceScore: 80,
      detected_at: detectedAt,
      support: current.low,
      resistance: res,
      description: `Current green candle completely engulfs previous red candle body, signaling aggressive buyer dominance.`,
    });
  }

  // Bearish Engulfing
  if (prev.close > prev.open && current.close < current.open && current.open >= prev.close && current.close <= prev.open) {
    patterns.push({
      pattern: 'Bearish Engulfing',
      direction: 'BEARISH',
      confidence: indicators.volumeRatio >= 1.2 ? 'HIGH' : 'MEDIUM',
      confidenceScore: 78,
      detected_at: detectedAt,
      support: sup,
      resistance: current.high,
      description: `Current red candle completely engulfs prior session's gain, warning of swift reversal.`,
    });
  }

  // 10. Higher Highs / Higher Lows vs Lower Highs / Lower Lows Structure
  if (n >= 15) {
    const recent = candles.slice(-15);
    let hhCount = 0;
    let hlCount = 0;
    let lhCount = 0;
    let llCount = 0;

    for (let i = 2; i < recent.length; i += 2) {
      if (recent[i].high > recent[i - 2].high) hhCount++;
      else lhCount++;
      if (recent[i].low > recent[i - 2].low) hlCount++;
      else llCount++;
    }

    if (hhCount >= 4 && hlCount >= 4) {
      patterns.push({
        pattern: 'Higher Highs & Higher Lows Structure',
        direction: 'BULLISH',
        confidence: 'HIGH',
        confidenceScore: 85,
        detected_at: detectedAt,
        support: sup,
        resistance: res,
        description: `Clear ascending price action staircase confirming an active algorithmic trend.`,
      });
    } else if (lhCount >= 4 && llCount >= 4) {
      patterns.push({
        pattern: 'Lower Highs & Lower Lows Structure',
        direction: 'BEARISH',
        confidence: 'HIGH',
        confidenceScore: 83,
        detected_at: detectedAt,
        support: sup,
        resistance: res,
        description: `Downward sequence of lower peaks and troughs, denoting persistent supply pressure.`,
      });
    }
  }

  // 11. Chart Formations: Double Bottom / Double Top
  if (n >= 40) {
    const slice = candles.slice(-40);
    // Double bottom: Two distinct lows within 1.5% separated by at least 10 candles with a peak in between
    let min1Idx = 0;
    let min1Val = slice[0].low;
    for (let i = 1; i < 20; i++) {
      if (slice[i].low < min1Val) {
        min1Val = slice[i].low;
        min1Idx = i;
      }
    }
    let min2Idx = 20;
    let min2Val = slice[20].low;
    for (let i = 21; i < slice.length; i++) {
      if (slice[i].low < min2Val) {
        min2Val = slice[i].low;
        min2Idx = i;
      }
    }

    // Check intermediate peak
    let midPeak = 0;
    for (let i = min1Idx; i <= min2Idx; i++) {
      if (slice[i].high > midPeak) midPeak = slice[i].high;
    }

    if (
      Math.abs(min1Val - min2Val) / min1Val <= 0.02 &&
      midPeak > min1Val * 1.04 &&
      current.close > min2Val
    ) {
      const isNecklineBreak = current.close >= midPeak;
      patterns.push({
        pattern: isNecklineBreak ? 'Double Bottom Breakout' : 'Possible Double Bottom',
        direction: 'BULLISH',
        confidence: isNecklineBreak ? 'HIGH' : 'LOW',
        confidenceScore: isNecklineBreak ? 85 : 55,
        isPossible: !isNecklineBreak,
        detected_at: detectedAt,
        support: (min1Val + min2Val) / 2,
        resistance: midPeak,
        description: isNecklineBreak
          ? `Confirmed Double Bottom formation breakout above neckline ₹${Math.round(midPeak * 100) / 100}.`
          : `Emerging potential Double Bottom with base support around ₹${Math.round(min1Val * 100) / 100}.`,
      });
    }

    // Double top
    let max1Idx = 0;
    let max1Val = slice[0].high;
    for (let i = 1; i < 20; i++) {
      if (slice[i].high > max1Val) {
        max1Val = slice[i].high;
        max1Idx = i;
      }
    }
    let max2Idx = 20;
    let max2Val = slice[20].high;
    for (let i = 21; i < slice.length; i++) {
      if (slice[i].high > max2Val) {
        max2Val = slice[i].high;
        max2Idx = i;
      }
    }
    let midTrough = 99999999;
    for (let i = max1Idx; i <= max2Idx; i++) {
      if (slice[i].low < midTrough) midTrough = slice[i].low;
    }

    if (
      Math.abs(max1Val - max2Val) / max1Val <= 0.02 &&
      midTrough < max1Val * 0.96 &&
      current.close < max2Val
    ) {
      const isNecklineDown = current.close <= midTrough;
      patterns.push({
        pattern: isNecklineDown ? 'Double Top Breakdown' : 'Possible Double Top',
        direction: 'BEARISH',
        confidence: isNecklineDown ? 'HIGH' : 'LOW',
        confidenceScore: isNecklineDown ? 84 : 52,
        isPossible: !isNecklineDown,
        detected_at: detectedAt,
        support: midTrough,
        resistance: (max1Val + max2Val) / 2,
        description: isNecklineDown
          ? `Confirmed Double Top breakdown below neckline ₹${Math.round(midTrough * 100) / 100}.`
          : `Possible Double Top resistance established around ₹${Math.round(max1Val * 100) / 100}.`,
      });
    }
  }

  // 12. Bull Flag / Bear Flag detection
  if (n >= 25) {
    const poleSlice = candles.slice(-25, -10);
    const flagSlice = candles.slice(-10);

    const poleGain = (poleSlice[poleSlice.length - 1].close - poleSlice[0].close) / poleSlice[0].close;
    const flagConsolidation = (flagSlice[flagSlice.length - 1].close - flagSlice[0].close) / flagSlice[0].close;

    if (poleGain >= 0.06 && flagConsolidation >= -0.03 && flagConsolidation <= 0.01) {
      patterns.push({
        pattern: 'Possible Bull Flag',
        direction: 'BULLISH',
        confidence: 'MEDIUM',
        confidenceScore: 68,
        isPossible: true,
        detected_at: detectedAt,
        support: flagSlice[0].low,
        resistance: res,
        description: `Tight high-level consolidation following a +${(poleGain * 100).toFixed(1)}% surge, forming a classic bull flag.`,
      });
    } else if (poleGain <= -0.06 && flagConsolidation <= 0.03 && flagConsolidation >= -0.01) {
      patterns.push({
        pattern: 'Possible Bear Flag',
        direction: 'BEARISH',
        confidence: 'MEDIUM',
        confidenceScore: 66,
        isPossible: true,
        detected_at: detectedAt,
        support: sup,
        resistance: flagSlice[0].high,
        description: `Sluggish consolidation following a -${(Math.abs(poleGain) * 100).toFixed(1)}% decline, characteristic of a bear flag.`,
      });
    }
  }

  return patterns;
}
