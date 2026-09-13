import type {
  Holding,
  NiftyMarketConfirmation,
  ScannerFilterOptions,
  ScannerSummary,
  SectorConfirmation,
  StockScanResult,
} from '../shared/types.ts';
import { getStocksByUniverse, NSE_STOCKS, type NSEStock } from './nseUniverse.ts';
import { marketDataProvider } from './marketData.ts';
import { calculateAllTechnicalIndicators } from './technicalIndicators.ts';
import { detectPatterns } from './patternDetection.ts';
import { marketConfirmationService } from './marketConfirmation.ts';
import { calculateStockScore } from './scoringEngine.ts';
import { getUserData } from './userData.ts';

// Cached scan runs
interface ScanCache {
  universe: string;
  timeframe: string;
  timestamp: number;
  results: StockScanResult[];
  summary: ScannerSummary;
}

const scanCacheMap = new Map<string, ScanCache>();

export class ScannerService {
  private isScanning = false;
  private scanProgress = {
    current: 0,
    total: 0,
    currentSymbol: '',
  };

  getProgress() {
    return {
      isScanning: this.isScanning,
      ...this.scanProgress,
    };
  }

  async scanSingleStock(
    stock: NSEStock,
    timeframe: 'daily' | 'weekly' = 'daily',
    nifty: NiftyMarketConfirmation,
    userHoldings: Holding[] = [],
    userWatchlistSymbols: Set<string> = new Set()
  ): Promise<StockScanResult | null> {
    try {
      const hist = await marketDataProvider.getHistoricalData(stock.symbol, timeframe, '1y');
      if (!hist.candles || hist.candles.length < 30) {
        return null;
      }

      const quote = await marketDataProvider.getQuote(stock.symbol);
      const candles = hist.candles;
      const lastCandle = candles[candles.length - 1];
      const prevCandle = candles[candles.length - 2] || lastCandle;

      const currentPrice = quote?.price ?? lastCandle.close;
      const change = quote?.change ?? (currentPrice - prevCandle.close);
      const changePercent = quote?.changePercent ?? (prevCandle.close ? ((change / prevCandle.close) * 100) : 0);

      const indicators = calculateAllTechnicalIndicators(candles);
      if (!indicators) return null;

      const patterns = detectPatterns(candles, indicators);

      const sectorConf: SectorConfirmation = await marketConfirmationService.getSectorConfirmation(
        stock.sector,
        changePercent,
        nifty.changePercent,
        marketDataProvider
      );

      const scoring = calculateStockScore(
        currentPrice,
        changePercent,
        indicators,
        patterns,
        nifty,
        sectorConf
      );

      // Check if user holds this stock
      const userHolding = userHoldings.find((h) => h.symbol.toUpperCase() === stock.symbol.toUpperCase());
      const isWatchlist = userWatchlistSymbols.has(stock.symbol.toUpperCase());

      const result: StockScanResult = {
        symbol: stock.symbol,
        name: stock.name,
        sector: stock.sector,
        series: (stock as any).series || 'EQ',
        marketCapCategory: (stock as any).marketCapCategory || 'Large Cap',
        price: Math.round(currentPrice * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        volume: quote?.volume || lastCandle.volume,
        timeframe,
        data_status: hist.status,
        dataStatus: hist.status,
        score: scoring.score,
        signal: scoring.signal,
        confidence: scoring.confidence,
        primary_signal: scoring.primary_signal,
        secondary_signals: scoring.secondary_signals,
        score_breakdown: scoring.breakdown,
        breakdown: scoring.breakdown,
        indicators,
        patterns,
        nifty,
        sector_conf: sectorConf,
        isHolding: !!userHolding,
        is_holding: !!userHolding,
        holdingDetails: userHolding
          ? {
              quantity: userHolding.quantity,
              avgPrice: userHolding.avgPrice,
              currentPrice,
              pnl: userHolding.pnl,
              pnlPercent: userHolding.pnlPercent,
            }
          : undefined,
        isWatchlist,
        in_watchlist: isWatchlist,
        last_updated: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };


      return result;
    } catch {
      return null;
    }
  }

  async runBatchScan(
    universe: string = 'NIFTY50',
    timeframe: 'daily' | 'weekly' = 'daily',
    userId: string = 'user-1',
    forceRefresh = false
  ): Promise<{ results: StockScanResult[]; summary: ScannerSummary }> {
    const cacheKey = `${universe}:${timeframe}:${userId}`;
    const cached = scanCacheMap.get(cacheKey);

    if (!forceRefresh && cached && Date.now() - cached.timestamp < 3 * 60 * 1000) {
      return { results: cached.results, summary: cached.summary };
    }

    this.isScanning = true;

    try {
      // 1. Resolve stocks for universe
      let targetStocks: NSEStock[] = [];
      const userData = getUserData(userId);
      const userHoldings = userData.holdings;
      const userWatchlistSet = new Set(userData.watchlist.map((w) => w.symbol.toUpperCase()));

      if (universe === 'HOLDINGS') {
        targetStocks = userHoldings.map((h) => ({
          symbol: h.symbol,
          name: h.name,
          sector: h.sector,
          series: 'EQ',
          marketCapCategory: 'LARGE' as const,
        }));
      } else if (universe === 'WATCHLIST') {
        targetStocks = userData.watchlist.map((w) => ({
          symbol: w.symbol,
          name: w.name,
          sector: w.sector,
          series: 'EQ',
          marketCapCategory: 'LARGE' as const,
        }));
      } else {
        targetStocks = getStocksByUniverse(universe);
      }

      if (targetStocks.length === 0) {
        targetStocks = getStocksByUniverse('NIFTY50');
      }

      this.scanProgress = {
        current: 0,
        total: targetStocks.length,
        currentSymbol: 'NIFTY 50 Macro',
      };

      // 2. Fetch NIFTY 50 macro confirmation once
      const nifty = await marketConfirmationService.getNiftyConfirmation(marketDataProvider);

      // 3. Batch scan stocks in chunks of 5 with small throttle to respect APIs
      const results: StockScanResult[] = [];
      const chunkSize = 5;

      for (let i = 0; i < targetStocks.length; i += chunkSize) {
        const chunk = targetStocks.slice(i, i + chunkSize);
        this.scanProgress.current = i;
        this.scanProgress.currentSymbol = chunk[0].symbol;

        const promises = chunk.map((stock) =>
          this.scanSingleStock(stock, timeframe, nifty, userHoldings, userWatchlistSet)
        );

        const chunkResults = await Promise.all(promises);
        for (const r of chunkResults) {
          if (r) results.push(r);
        }

        // Slight yield to keep server responsive
        await new Promise((resolve) => setTimeout(resolve, 30));
      }

      this.scanProgress.current = targetStocks.length;

      // Sort results by AI Score descending
      results.sort((a, b) => b.score - a.score);

      // 4. Calculate Summary
      let strongBullishCount = 0;
      let bullishCount = 0;
      let neutralCount = 0;
      let bearishCount = 0;
      let strongBearishCount = 0;
      let breakoutCount = 0;
      let totalVolumeRatio = 0;

      for (const r of results) {
        if (r.signal === 'STRONG BULLISH') strongBullishCount++;
        else if (r.signal === 'BULLISH') bullishCount++;
        else if (r.signal === 'NEUTRAL') neutralCount++;
        else if (r.signal === 'BEARISH') bearishCount++;
        else if (r.signal === 'STRONG BEARISH') strongBearishCount++;

        if (r.patterns.some((p) => p.pattern.includes('Breakout'))) {
          breakoutCount++;
        }
        totalVolumeRatio += r.indicators.volumeRatio;
      }

      // Top setups
      const topSetups = results.slice(0, 5).map((r) => ({
        symbol: r.symbol,
        score: r.score,
        signal: r.signal,
        primary_signal: r.primary_signal,
      }));

      // Top gainers
      const topGainers = [...results]
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 5)
        .map((r) => ({
          symbol: r.symbol,
          changePercent: r.changePercent,
          price: r.price,
        }));

      // Top losers
      const topLosers = [...results]
        .sort((a, b) => a.changePercent - b.changePercent)
        .slice(0, 5)
        .map((r) => ({
          symbol: r.symbol,
          changePercent: r.changePercent,
          price: r.price,
        }));

      // Market breadth
      const breadthAdvancing = results.filter((r) => r.changePercent > 0).length;
      const breadthDeclining = results.filter((r) => r.changePercent < 0).length;

      const summary: ScannerSummary = {
        totalScanned: results.length,
        strongBullishCount,
        bullishCount,
        neutralCount,
        bearishCount,
        strongBearishCount,
        breakoutCount,
        averageVolumeRatio: results.length ? Math.round((totalVolumeRatio / results.length) * 100) / 100 : 1,
        niftyStatus: nifty,
        topSetups,
        topGainers,
        topLosers,
        marketBreadth: {
          advancing: breadthAdvancing,
          declining: breadthDeclining,
          unchanged: results.length - breadthAdvancing - breadthDeclining,
        },
        scannedAt: new Date().toISOString(),
      };

      const out = { results, summary };
      scanCacheMap.set(cacheKey, {
        universe,
        timeframe,
        timestamp: Date.now(),
        results,
        summary,
      });

      return out;
    } finally {
      this.isScanning = false;
    }
  }

  // Filter scan results based on user filter criteria or presets
  filterResults(results: StockScanResult[], filters: ScannerFilterOptions): StockScanResult[] {
    return results.filter((item) => {
      // Preset matching
      if (filters.preset) {
        switch (filters.preset) {
          case 'BULLISH_BREAKOUT':
            if (!item.patterns.some((p) => p.pattern.includes('Breakout') && p.direction === 'BULLISH')) return false;
            break;
          case 'BEARISH_BREAKDOWN':
            if (!item.patterns.some((p) => p.pattern.includes('Breakdown') && p.direction === 'BEARISH')) return false;
            break;
          case 'GOLDEN_CROSS':
            if (!item.patterns.some((p) => p.pattern.includes('Golden') || p.pattern.includes('EMA Bullish Cross'))) return false;
            break;
          case 'DEATH_CROSS':
            if (!item.patterns.some((p) => p.pattern.includes('Death') || p.pattern.includes('EMA Bearish Cross'))) return false;
            break;
          case 'HIGH_VOLUME':
            if (item.indicators.volumeRatio < 1.8) return false;
            break;
          case 'MOMENTUM_LEADERS':
            if (item.score < 75) return false;
            break;
          case 'OVERSOLD_REVERSAL':
            if (item.indicators.rsi14 > 38 || !item.patterns.some((p) => p.direction === 'BULLISH')) return false;
            break;
          case '52W_HIGH':
            if (item.indicators.distFrom52wHigh < -3.0) return false;
            break;
          case '52W_LOW':
            if (item.indicators.distFrom52wLow > 3.0) return false;
            break;
          case 'TIGHT_CONSOLIDATION':
            if (item.indicators.bollingerBands.bandwidth > 6.0) return false;
            break;
        }
      }

      // Signal filter
      if (filters.signal && filters.signal !== 'ALL') {
        if (filters.signal === 'BULLISH_ALL' && !item.signal.includes('BULLISH')) return false;
        if (filters.signal === 'BEARISH_ALL' && !item.signal.includes('BEARISH')) return false;
        if (filters.signal !== 'BULLISH_ALL' && filters.signal !== 'BEARISH_ALL' && item.signal !== filters.signal) return false;
      }

      // Score range
      if (filters.minScore !== undefined && item.score < filters.minScore) return false;
      if (filters.maxScore !== undefined && item.score > filters.maxScore) return false;

      // Price range
      if (filters.minPrice !== undefined && item.price < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && item.price > filters.maxPrice) return false;

      // Volume ratio
      if (filters.minVolumeRatio !== undefined && item.indicators.volumeRatio < filters.minVolumeRatio) return false;

      // RSI range
      if (filters.minRsi !== undefined && item.indicators.rsi14 < filters.minRsi) return false;
      if (filters.maxRsi !== undefined && item.indicators.rsi14 > filters.maxRsi) return false;

      // Sector
      if (filters.sector && filters.sector !== 'ALL' && item.sector !== filters.sector) return false;

      // Moving average filters
      if (filters.aboveEma20 && item.indicators.priceVsEma20 <= 0) return false;
      if (filters.aboveEma50 && item.indicators.priceVsEma50 <= 0) return false;
      if (filters.aboveEma200 && item.indicators.priceVsEma200 <= 0) return false;

      // Holdings only
      if (filters.onlyHoldings && !item.isHolding) return false;

      // Watchlist only
      if (filters.onlyWatchlist && !item.isWatchlist) return false;

      // Search keyword
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        const sym = item.symbol.toLowerCase();
        const name = item.name.toLowerCase();
        if (!sym.includes(q) && !name.includes(q)) return false;
      }

      return true;
    });
  }
}

export const scannerService = new ScannerService();
