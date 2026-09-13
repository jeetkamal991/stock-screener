import express from 'express';
import { scannerService } from './scannerService.ts';
import { marketDataProvider } from './marketData.ts';
import { marketConfirmationService } from './marketConfirmation.ts';
import { generateAIAnalysis } from './aiAnalysis.ts';
import { runHistoricalBacktest } from './backtesting.ts';
import {
  addAlert,
  addHolding,
  addToWatchlist,
  deleteAlert,
  deleteHolding,
  evaluateAlerts,
  getAllUsers,
  getUserData,
  removeFromWatchlist,
  toggleAlert,
} from './userData.ts';
import { NSE_STOCKS, SECTOR_INDICES } from './nseUniverse.ts';
import { AVAILABLE_UNIVERSES } from '../shared/types.ts';
import { formatISTDateTime, getMarketStatus } from './marketData/marketHours.ts';

export function createApp(): express.Express {
  const app = express();
  app.use(express.json());

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // URL normalization: ensure Vercel rewrites to /market/* or /api/* all match /api/* routes
  app.use((req, res, next) => {
    if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/@') && !req.url.startsWith('/src') && !req.url.startsWith('/node_modules')) {
      req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    }
    next();
  });

  // Root API route
  app.get(['/api', '/api/index', '/api/'], (req, res) => {
    res.json({
      status: 'ok',
      service: 'Stock Screener API',
      timestamp: new Date().toISOString(),
    });
  });

  // Simple session tracking: defaults to 'user-1'
  let currentUserId = 'user-1';

  // =================== AUTH & USER / PORTFOLIO ROUTES ===================
  app.get(['/api/users', '/api/portfolio/users'], (req, res) => {
    res.json({
      currentUser: getUserData(currentUserId).profile,
      allUsers: getAllUsers(),
    });
  });

  app.post('/api/user/switch', (req, res) => {
    const { userId } = req.body;
    if (userId) {
      currentUserId = userId;
    }
    res.json({ success: true, profile: getUserData(currentUserId).profile });
  });

  // Holdings
  app.get(['/api/user/holdings', '/api/portfolio/:userId/holdings'], (req, res) => {
    const uid = req.params.userId || currentUserId;
    const data = getUserData(uid);
    res.json(data.holdings);
  });

  app.post(['/api/user/holdings', '/api/portfolio/:userId/holdings'], (req, res) => {
    const uid = req.params.userId || currentUserId;
    addHolding(uid, req.body);
    const data = getUserData(uid);
    res.json(data.holdings);
  });

  app.delete(['/api/user/holdings/:id', '/api/portfolio/:userId/holdings/:id'], (req, res) => {
    const uid = req.params.userId || currentUserId;
    deleteHolding(uid, req.params.id);
    const data = getUserData(uid);
    res.json(data.holdings);
  });

  // Watchlist
  app.get(['/api/user/watchlist', '/api/portfolio/:userId/watchlist'], (req, res) => {
    const uid = req.params.userId || currentUserId;
    const data = getUserData(uid);
    res.json(data.watchlist);
  });

  app.post(['/api/user/watchlist', '/api/portfolio/:userId/watchlist'], (req, res) => {
    const uid = req.params.userId || currentUserId;
    addToWatchlist(uid, req.body);
    const data = getUserData(uid);
    res.json(data.watchlist);
  });

  app.delete(['/api/user/watchlist/:symbol', '/api/portfolio/:userId/watchlist/:symbol'], (req, res) => {
    const uid = req.params.userId || currentUserId;
    removeFromWatchlist(uid, req.params.symbol);
    const data = getUserData(uid);
    res.json(data.watchlist);
  });

  // Alerts
  app.get(['/api/user/alerts', '/api/portfolio/:userId/alerts'], (req, res) => {
    const uid = req.params.userId || currentUserId;
    const data = getUserData(uid);
    res.json(data.alerts);
  });

  app.post(['/api/user/alerts', '/api/portfolio/:userId/alerts'], (req, res) => {
    const uid = req.params.userId || currentUserId;
    addAlert(uid, req.body);
    const data = getUserData(uid);
    res.json(data.alerts);
  });

  app.patch(['/api/user/alerts/:id/toggle', '/api/portfolio/:userId/alerts/:id/toggle'], (req, res) => {
    const uid = req.params.userId || currentUserId;
    toggleAlert(uid, req.params.id);
    const data = getUserData(uid);
    res.json(data.alerts);
  });

  app.delete(['/api/user/alerts/:id', '/api/portfolio/:userId/alerts/:id'], (req, res) => {
    const uid = req.params.userId || currentUserId;
    deleteAlert(uid, req.params.id);
    const data = getUserData(uid);
    res.json(data.alerts);
  });

  // =================== MARKET OVERVIEW ROUTES ===================
  app.get(['/api/market/status', '/api/scanner/status'], (req, res) => {
    const status = getMarketStatus();
    res.json(status);
  });

  app.get(['/api/market/nifty', '/api/scanner/nifty'], async (req, res) => {
    try {
      const nifty = await marketConfirmationService.getNiftyConfirmation(marketDataProvider);
      const statusInfo = getMarketStatus();
      res.json({
        ...nifty,
        marketStatus: statusInfo.marketStatus,
        marketIsOpen: statusInfo.isOpen,
        marketMessage: statusInfo.message,
        currentIstTime: statusInfo.currentIstTime,
        tradingDate: statusInfo.tradingDate,
        dataSource: marketDataProvider.name,
      });
    } catch (err: any) {
      res.status(503).json({
        error: 'MARKET_DATA_UNAVAILABLE',
        message: err.message || 'Unable to retrieve real NIFTY 50 data from market provider',
        provider: marketDataProvider.name,
        timestamp: new Date().toISOString(),
      });
    }
  });

  app.get(['/api/market/sectors', '/api/scanner/sectors'], async (req, res) => {
    try {
      const sectors = await marketDataProvider.getSectorData();
      res.json(sectors);
    } catch (err: any) {
      res.status(503).json({
        error: 'MARKET_DATA_UNAVAILABLE',
        message: err.message || 'Failed to retrieve sector market data',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // =================== SCANNER ROUTES ===================
  app.get('/api/scanner/universes', (req, res) => {
    const sectors = Object.keys(SECTOR_INDICES);
    res.json({
      universes: AVAILABLE_UNIVERSES,
      sectors,
    });
  });

  app.get('/api/scanner/progress', (req, res) => {
    res.json(scannerService.getProgress());
  });

  const handleRunScan = async (req: express.Request, res: express.Response) => {
    try {
      const universe = ((req.method === 'POST' ? req.body.universe : req.query.universe) as string) || 'nifty50';
      const timeframe = (((req.method === 'POST' ? req.body.timeframe : req.query.timeframe) as string) || 'daily') as 'daily' | 'weekly';
      const refresh = (req.method === 'POST' ? req.body.refresh : req.query.refresh) === true || req.query.refresh === 'true';
      const uid = (req.method === 'POST' ? req.body.userId : req.query.userId) || currentUserId;

      const data = await scannerService.runBatchScan(universe, timeframe, uid, refresh);

      // Evaluate user alerts against scan results
      const triggeredAlerts = evaluateAlerts(uid, data.results);

      res.json({
        ...data,
        triggeredAlerts,
      });
    } catch (err: any) {
      res.status(500).json({
        error: 'SCAN_FAILED',
        message: err.message || 'Scan failed',
        timestamp: new Date().toISOString(),
      });
    }
  };

  app.get('/api/scanner/run', handleRunScan);
  app.post('/api/scanner/run', handleRunScan);

  app.get('/api/scanner/stock/:symbol', async (req, res) => {
    try {
      const sym = req.params.symbol.toUpperCase();
      const timeframe = ((req.query.timeframe as string) || 'daily') as 'daily' | 'weekly';

      const stockMeta = NSE_STOCKS.find((s) => s.symbol.toUpperCase() === sym) || {
        symbol: sym,
        name: `${sym} Ltd.`,
        sector: 'Diversified',
        series: 'EQ',
        marketCapCategory: 'LARGE' as const,
      };

      const nifty = await marketConfirmationService.getNiftyConfirmation(marketDataProvider);
      const userData = getUserData(currentUserId);
      const watchlistSet = new Set(userData.watchlist.map((w) => w.symbol.toUpperCase()));

      const result = await scannerService.scanSingleStock(
        stockMeta,
        timeframe,
        nifty,
        userData.holdings,
        watchlistSet
      );

      if (!result) {
        return res.status(404).json({
          error: 'STOCK_DATA_UNAVAILABLE',
          message: `Insufficient or unavailable market data for stock ${sym}`,
        });
      }

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'STOCK_SCAN_ERROR', message: err.message });
    }
  });

  app.get('/api/scanner/chart/:symbol', async (req, res) => {
    try {
      const sym = req.params.symbol.toUpperCase();
      const timeframe = ((req.query.timeframe as string) || 'daily') as 'daily' | 'weekly';
      const range = (req.query.range as string) || (timeframe === 'weekly' ? '2y' : '1y');

      const hist = await marketDataProvider.getHistoricalData(sym, timeframe, range);
      if (hist.status === 'ERROR' && hist.candles.length === 0) {
        return res.status(503).json(hist);
      }
      res.json(hist);
    } catch (err: any) {
      res.status(500).json({ error: 'CHART_DATA_ERROR', message: err.message });
    }
  });

  // Gemini AI Analysis Endpoint
  app.post('/api/scanner/ai-explain', async (req, res) => {
    try {
      const scanResult = req.body;
      if (!scanResult || !scanResult.symbol) {
        return res.status(400).json({ error: 'Missing stock scan payload' });
      }
      const explanation = await generateAIAnalysis(scanResult);
      res.json(explanation);
    } catch (err: any) {
      res.status(500).json({ error: 'AI_EXPLAIN_ERROR', message: err.message || 'AI analysis generation failed' });
    }
  });

  // Backtest Endpoint
  const handleBacktest = async (req: express.Request, res: express.Response) => {
    try {
      const minScore = parseInt((req.method === 'POST' ? req.body.minScore : req.query.minScore) || '75', 10);
      const topSymbols = NSE_STOCKS.slice(0, 15).map((s) => s.symbol);
      const results = await runHistoricalBacktest(topSymbols, marketDataProvider, minScore);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: 'BACKTEST_ERROR', message: err.message || 'Backtesting execution failed' });
    }
  };

  app.get('/api/backtest/run', handleBacktest);
  app.get('/api/scanner/backtest', handleBacktest);
  app.post('/api/scanner/backtest', handleBacktest);

  // Health check endpoint (never exposes keys or secrets)
  app.get('/api/health', async (req, res) => {
    const health = await marketDataProvider.checkHealth();
    const marketStatus = getMarketStatus();

    res.json({
      status: 'ok',
      marketData: {
        provider: marketDataProvider.name,
        configured: health.configured,
        reachable: health.reachable,
        latencyMs: health.latencyMs,
        error: health.error,
      },
      marketHours: {
        status: marketStatus.marketStatus,
        isOpen: marketStatus.isOpen,
        currentIstTime: marketStatus.currentIstTime,
        message: marketStatus.message,
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Central error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[API Error]:', err);
    res.status(500).json({
      status: 'error',
      error: err?.message || 'Internal Server Error',
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}

export const app = createApp();
