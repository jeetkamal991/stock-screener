import type { BacktestRecord, BacktestSummary, OHLCV } from '../shared/types.ts';
import { calculateAllTechnicalIndicators } from './technicalIndicators.ts';
import { detectPatterns } from './patternDetection.ts';
import { calculateStockScore } from './scoringEngine.ts';
import type { MarketDataProvider } from './marketData.ts';

export async function runHistoricalBacktest(
  symbols: string[],
  dataProvider: MarketDataProvider,
  minScore: number = 75
): Promise<BacktestSummary> {
  const records: BacktestRecord[] = [];

  // Fetch real historical NIFTY benchmark data once
  const niftyHist = await dataProvider.getHistoricalData('^NSEI', 'daily', '1y');
  const niftyCandles = niftyHist.candles || [];

  for (const sym of symbols.slice(0, 15)) {
    try {
      const hist = await dataProvider.getHistoricalData(sym, 'daily', '1y');
      const candles = hist.candles || [];
      if (candles.length < 90) continue;

      // Slide window from candle 50 to candle (length - 20) with 5-day stride
      for (let t = 50; t < candles.length - 20; t += 5) {
        // Strict historical slice: ONLY data up to index t
        const windowCandles: OHLCV[] = candles.slice(0, t + 1);
        const indicators = calculateAllTechnicalIndicators(windowCandles);
        if (!indicators) continue;

        const patterns = detectPatterns(windowCandles, indicators);
        const currentCandle = windowCandles[windowCandles.length - 1];
        const entryPrice = currentCandle.close;
        const changePercent = windowCandles.length >= 2
          ? ((entryPrice - windowCandles[windowCandles.length - 2].close) / windowCandles[windowCandles.length - 2].close) * 100
          : 0;

        // Correlate with real NIFTY candle around the same timestamp or relative index
        const niftyIdx = Math.min(t, niftyCandles.length - 1);
        const niftyCandle = niftyCandles[niftyIdx];
        const niftyPrice = niftyCandle?.close || entryPrice;
        const prevNiftyCandle = niftyIdx > 0 ? niftyCandles[niftyIdx - 1] : niftyCandle;
        const niftyChange = niftyCandle && prevNiftyCandle ? niftyCandle.close - prevNiftyCandle.close : 0;
        const niftyChangePercent = prevNiftyCandle && prevNiftyCandle.close > 0 ? (niftyChange / prevNiftyCandle.close) * 100 : 0;

        const historicalNifty = {
          niftyPrice,
          change: Math.round(niftyChange * 100) / 100,
          changePercent: Math.round(niftyChangePercent * 100) / 100,
          trend: (niftyChangePercent >= 0 ? 'BULLISH' : 'BEARISH') as 'BULLISH' | 'BEARISH',
          ema20: indicators.ema20,
          ema50: indicators.ema50,
          ema200: indicators.ema200,
          rsi: indicators.rsi14,
          momentum: niftyChangePercent >= 0 ? 'Positive momentum' : 'Negative drift',
          regime: (niftyChangePercent >= 0 ? 'BULLISH' : 'BEARISH') as 'BULLISH' | 'BEARISH',
          confirmationStatus: 'STRONG' as const,
        };

        const historicalSector = {
          sectorName: 'NSE Sector',
          sectorIndexSymbol: '^NSEI',
          sectorPrice: niftyPrice,
          sectorChangePercent: niftyChangePercent,
          sectorTrend: (niftyChangePercent >= 0 ? 'BULLISH' : 'BEARISH') as 'BULLISH' | 'BEARISH',
          sectorMomentum: Math.min(100, Math.max(0, Math.round(indicators.rsi14))),
          stockRelativeStrengthVsSector: Math.round((changePercent - niftyChangePercent) * 100) / 100,
          sectorRelativeStrengthVsNifty: 0,
          confirmation: 'STRONG' as const,
        };

        const scoreResult = calculateStockScore(
          entryPrice,
          changePercent,
          indicators,
          patterns,
          historicalNifty,
          historicalSector
        );

        // Only record strong bullish or strong signals
        if (scoreResult.score >= minScore || scoreResult.score <= (100 - minScore)) {
          const isBullish = scoreResult.score >= minScore;
          const p5 = candles[t + 5]?.close ?? null;
          const p10 = candles[t + 10]?.close ?? null;
          const p20 = candles[t + 20]?.close ?? null;
          const p60 = candles[t + 60]?.close ?? null;

          const ret5 = p5 ? Math.round(((p5 - entryPrice) / entryPrice) * 10000) / 100 : null;
          const ret10 = p10 ? Math.round(((p10 - entryPrice) / entryPrice) * 10000) / 100 : null;
          const ret20 = p20 ? Math.round(((p20 - entryPrice) / entryPrice) * 10000) / 100 : null;
          const ret60 = p60 ? Math.round(((p60 - entryPrice) / entryPrice) * 10000) / 100 : null;

          // Measure maximum gain and maximum drawdown within 20 days
          let maxHigh = entryPrice;
          let minLow = entryPrice;
          const lookaheadMax = Math.min(candles.length - 1, t + 20);
          for (let f = t + 1; f <= lookaheadMax; f++) {
            if (candles[f].high > maxHigh) maxHigh = candles[f].high;
            if (candles[f].low < minLow) minLow = candles[f].low;
          }

          const maxGain = Math.round(((maxHigh - entryPrice) / entryPrice) * 10000) / 100;
          const maxDrawdown = Math.round(((minLow - entryPrice) / entryPrice) * 10000) / 100;

          const isWin = isBullish ? (ret20 !== null && ret20 > 0) : (ret20 !== null && ret20 < 0);

          records.push({
            id: `${sym}-${currentCandle.dateStr}-${t}`,
            signal_date: currentCandle.dateStr,
            symbol: sym,
            signal: scoreResult.signal,
            score: scoreResult.score,
            entry_price: entryPrice,
            price_after_5_days: p5,
            price_after_10_days: p10,
            price_after_20_days: p20,
            price_after_60_days: p60,
            return_5d: ret5,
            return_10d: ret10,
            return_20d: ret20,
            return_60d: ret60,
            maximum_gain: maxGain,
            maximum_drawdown: maxDrawdown,
            status: isWin ? 'WIN' : 'LOSS',
          });
        }
      }
    } catch {
      continue;
    }
  }

  // Calculate summary metrics
  const total = records.length;
  if (total === 0) {
    return {
      totalSignals: 0,
      bullishSignals: 0,
      bearishSignals: 0,
      winRate5d: 0,
      winRate10d: 0,
      winRate20d: 0,
      winRate60d: 0,
      averageReturn: 0,
      medianReturn: 0,
      maxDrawdown: 0,
      bestTrade: null,
      worstTrade: null,
      records: [],
    };
  }

  const bullishRecords = records.filter((r) => r.signal.includes('BULLISH'));
  const bearishRecords = records.filter((r) => r.signal.includes('BEARISH'));

  const valid5d = records.filter((r) => r.return_5d !== null);
  const win5d = valid5d.filter((r) => (r.signal.includes('BULLISH') ? r.return_5d! > 0 : r.return_5d! < 0)).length;

  const valid10d = records.filter((r) => r.return_10d !== null);
  const win10d = valid10d.filter((r) => (r.signal.includes('BULLISH') ? r.return_10d! > 0 : r.return_10d! < 0)).length;

  const valid20d = records.filter((r) => r.return_20d !== null);
  const win20d = valid20d.filter((r) => (r.signal.includes('BULLISH') ? r.return_20d! > 0 : r.return_20d! < 0)).length;

  const valid60d = records.filter((r) => r.return_60d !== null);
  const win60d = valid60d.filter((r) => (r.signal.includes('BULLISH') ? r.return_60d! > 0 : r.return_60d! < 0)).length;

  const returns20 = valid20d.map((r) => (r.signal.includes('BULLISH') ? r.return_20d! : -r.return_20d!));
  returns20.sort((a, b) => a - b);

  const avgRet = returns20.length ? returns20.reduce((a, b) => a + b, 0) / returns20.length : 0;
  const medRet = returns20.length ? returns20[Math.floor(returns20.length / 2)] : 0;

  let worstDrawdown = 0;
  let bestTrade: { symbol: string; gain: number; date: string } | null = null;
  let worstTrade: { symbol: string; loss: number; date: string } | null = null;

  for (const r of records) {
    if (r.maximum_drawdown < worstDrawdown) worstDrawdown = r.maximum_drawdown;
    const effReturn = r.return_20d ?? r.return_10d ?? 0;
    if (!bestTrade || effReturn > bestTrade.gain) {
      bestTrade = { symbol: r.symbol, gain: effReturn, date: r.signal_date };
    }
    if (!worstTrade || effReturn < worstTrade.loss) {
      worstTrade = { symbol: r.symbol, loss: effReturn, date: r.signal_date };
    }
  }

  return {
    totalSignals: total,
    bullishSignals: bullishRecords.length,
    bearishSignals: bearishRecords.length,
    winRate5d: valid5d.length ? Math.round((win5d / valid5d.length) * 1000) / 10 : 0,
    winRate10d: valid10d.length ? Math.round((win10d / valid10d.length) * 1000) / 10 : 0,
    winRate20d: valid20d.length ? Math.round((win20d / valid20d.length) * 1000) / 10 : 0,
    winRate60d: valid60d.length ? Math.round((win60d / valid60d.length) * 1000) / 10 : 0,
    averageReturn: Math.round(avgRet * 100) / 100,
    medianReturn: Math.round(medRet * 100) / 100,
    maxDrawdown: Math.round(worstDrawdown * 100) / 100,
    bestTrade,
    worstTrade,
    records: records.slice(0, 100), // top 100 records for display
  };
}
