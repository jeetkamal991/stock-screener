import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { scannerService } from './server/scannerService.ts';
import { marketDataProvider } from './server/marketData.ts';
import { marketConfirmationService } from './server/marketConfirmation.ts';
import { generateAIAnalysis } from './server/aiAnalysis.ts';
import { runHistoricalBacktest } from './server/backtesting.ts';
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
} from './server/userData.ts';
import { NSE_STOCKS, SECTOR_INDICES } from './server/nseUniverse.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
  app.get(['/api/market/nifty', '/api/scanner/nifty'], async (req, res) => {
    try {
      const nifty = await marketConfirmationService.getNiftyConfirmation(marketDataProvider);
      res.json(nifty);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get(['/api/market/sectors', '/api/scanner/sectors'], async (req, res) => {
    try {
      const sectors = await marketDataProvider.getSectorData();
      res.json(sectors);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // =================== SCANNER ROUTES ===================
  app.get('/api/scanner/universes', (req, res) => {
    const sectors = Object.keys(SECTOR_INDICES);
    res.json({
      universes: [
        { id: 'NIFTY50', label: 'NIFTY 50' },
        { id: 'NIFTY100', label: 'NIFTY 100' },
        { id: 'NIFTY200', label: 'NIFTY 200' },
        { id: 'HOLDINGS', label: 'My Active Holdings' },
        { id: 'WATCHLIST', label: 'My Watchlist' },
      ],
      sectors,
    });
  });

  app.get('/api/scanner/progress', (req, res) => {
    res.json(scannerService.getProgress());
  });

  const handleRunScan = async (req: express.Request, res: express.Response) => {
    try {
      const universe = ((req.method === 'POST' ? req.body.universe : req.query.universe) as string) || 'NIFTY50';
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
      res.status(500).json({ error: err.message || 'Scan failed' });
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
        name: sym,
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
        return res.status(404).json({ error: 'Stock not found or insufficient historical data' });
      }

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/scanner/chart/:symbol', async (req, res) => {
    try {
      const sym = req.params.symbol.toUpperCase();
      const timeframe = ((req.query.timeframe as string) || 'daily') as 'daily' | 'weekly';
      const range = (req.query.range as string) || (timeframe === 'weekly' ? '2y' : '1y');

      const hist = await marketDataProvider.getHistoricalData(sym, timeframe, range);
      res.json(hist);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
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
      res.status(500).json({ error: err.message || 'AI analysis generation failed' });
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
      res.status(500).json({ error: err.message || 'Backtesting execution failed' });
    }
  };

  app.get('/api/backtest/run', handleBacktest);
  app.get('/api/scanner/backtest', handleBacktest);
  app.post('/api/scanner/backtest', handleBacktest);


  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NSE Stock Scanner server running on port ${PORT}`);
  });
}

startServer();
