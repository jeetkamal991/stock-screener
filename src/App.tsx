import React, { useEffect, useState } from 'react';
import {
  AlertRule,
  BacktestSummary,
  Holding,
  NiftyMarketConfirmation,
  OHLCV,
  ScannerSummary,
  StockScanResult,
  UserProfile,
  WatchlistItem,
} from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { ScannerView } from './components/ScannerView.tsx';
import { HoldingsView } from './components/HoldingsView.tsx';
import { WatchlistView } from './components/WatchlistView.tsx';
import { SectorMomentumView } from './components/SectorMomentumView.tsx';
import { BacktestView } from './components/BacktestView.tsx';
import { AlertsView } from './components/AlertsView.tsx';
import { StockDetailModal } from './components/StockDetailModal.tsx';

const AVAILABLE_UNIVERSES = [
  { id: 'nifty50', label: 'NIFTY 50' },
  { id: 'nifty100', label: 'NIFTY 100' },
  { id: 'nifty200', label: 'NIFTY 200' },
  { id: 'nifty_bank', label: 'NIFTY Bank Universe' },
  { id: 'nifty_it', label: 'NIFTY IT Universe' },
  { id: 'nifty_auto', label: 'NIFTY Auto Universe' },
  { id: 'holdings', label: 'My Portfolio Holdings' },
  { id: 'watchlist', label: 'My Watchlist' },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'user_1',
    name: 'Rohan Sharma',
    email: 'rohan.sharma@trader.in',
  });

  const [activeTab, setActiveTab] = useState<'scanner' | 'holdings' | 'watchlist' | 'sectors' | 'backtest' | 'alerts'>('scanner');
  const [universe, setUniverse] = useState<string>('nifty50');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly'>('daily');

  // Scanner state
  const [scanResults, setScanResults] = useState<StockScanResult[]>([]);
  const [scanSummary, setScanSummary] = useState<ScannerSummary | null>(null);
  const [isLoadingScan, setIsLoadingScan] = useState<boolean>(false);

  // Portfolio & User Data
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [alerts, setAlerts] = useState<AlertRule[]>([]);

  // Macro & Sector Data
  const [nifty, setNifty] = useState<NiftyMarketConfirmation | null>(null);
  const [sectors, setSectors] = useState<any[]>([]);

  // Stock Detail Modal
  const [selectedStock, setSelectedStock] = useState<StockScanResult | null>(null);
  const [selectedStockCandles, setSelectedStockCandles] = useState<OHLCV[]>([]);

  // Toast message
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Load User Data
  const fetchUserData = async () => {
    try {
      const [hRes, wRes, aRes] = await Promise.all([
        fetch(`/api/portfolio/${currentUser.id}/holdings`),
        fetch(`/api/portfolio/${currentUser.id}/watchlist`),
        fetch(`/api/portfolio/${currentUser.id}/alerts`),
      ]);
      if (hRes.ok) setHoldings(await hRes.json());
      if (wRes.ok) setWatchlist(await wRes.json());
      if (aRes.ok) setAlerts(await aRes.json());
    } catch (e) {
      console.error('Failed to load user portfolio data', e);
    }
  };

  // Load Nifty & Sectors
  const fetchMacroData = async () => {
    try {
      const [nRes, sRes] = await Promise.all([
        fetch('/api/scanner/nifty'),
        fetch('/api/scanner/sectors'),
      ]);
      if (nRes.ok) setNifty(await nRes.json());
      if (sRes.ok) setSectors(await sRes.json());
    } catch (e) {
      console.error('Failed to load macro/sector data', e);
    }
  };

  // Run Scanner
  const runScanner = async (u = universe, tf = timeframe, refresh = false) => {
    setIsLoadingScan(true);
    try {
      const res = await fetch('/api/scanner/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universe: u,
          timeframe: tf,
          userId: currentUser.id,
          refresh,
        }),
      });
      if (!res.ok) throw new Error('Scanner API failure');
      const data = await res.json();
      setScanResults(data.results || []);
      setScanSummary(data.summary || null);

      // Check if any alerts were triggered
      if (data.results) {
        checkAndTriggerAlerts(data.results);
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      showToast('Scanner request encountered an error. Please retry.');
    } finally {
      setIsLoadingScan(false);
    }
  };

  // Check alert triggers against scan results
  const checkAndTriggerAlerts = (results: StockScanResult[]) => {
    for (const rule of alerts) {
      if (!rule.enabled) continue;
      for (const st of results) {
        if (rule.symbol !== 'ALL' && rule.symbol !== st.symbol) continue;

        let triggered = false;
        let msg = '';
        if (rule.type === 'SCORE_ABOVE' && rule.threshold && st.score >= rule.threshold) {
          triggered = true;
          msg = `${st.symbol} scored ${st.score} (>= ${rule.threshold})`;
        } else if (rule.type === 'BULLISH_BREAKOUT' && st.patterns.some((p) => p.pattern.includes('Breakout') && p.direction === 'BULLISH')) {
          triggered = true;
          msg = `${st.symbol} triggered Bullish Breakout pattern`;
        } else if (rule.type === 'BEARISH_BREAKDOWN' && st.patterns.some((p) => p.pattern.includes('Breakdown') && p.direction === 'BEARISH')) {
          triggered = true;
          msg = `${st.symbol} triggered Bearish Breakdown pattern`;
        } else if (rule.type === 'VOLUME_2X' && st.indicators.volumeRatio >= 2.0) {
          triggered = true;
          msg = `${st.symbol} volume expanded to ${st.indicators.volumeRatio}x average`;
        } else if (rule.type === '52W_HIGH' && st.indicators.distFrom52wHigh >= -1.0) {
          triggered = true;
          msg = `${st.symbol} trading at 52-Week High (₹${st.price})`;
        }

        if (triggered && (!rule.lastTriggered || Date.now() - new Date(rule.lastTriggered).getTime() > 10 * 60 * 1000)) {
          showToast(`🔔 Alert Triggered: ${msg}`);
          break;
        }
      }
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchMacroData();
    runScanner('nifty50', 'daily', false);
  }, [currentUser.id]);

  // View Stock Detail
  const handleSelectStock = async (stock: StockScanResult) => {
    setSelectedStock(stock);
    try {
      const res = await fetch(`/api/scanner/chart/${stock.symbol}?timeframe=${timeframe}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedStockCandles(data.candles || []);
      }
    } catch (e) {
      console.error('Failed to load stock candles', e);
    }
  };

  // Add To Watchlist
  const handleAddToWatchlist = async (stock: StockScanResult) => {
    try {
      const res = await fetch(`/api/portfolio/${currentUser.id}/watchlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          notes: `Added from AI Scanner with score ${stock.score}`,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setWatchlist(updated);
        showToast(`Added ${stock.symbol} to your Watchlist`);
        // update local scan results
        setScanResults((prev) =>
          prev.map((s) => (s.symbol === stock.symbol ? { ...s, isWatchlist: true } : s))
        );
      }
    } catch (e) {
      console.error('Failed to add to watchlist', e);
    }
  };

  // Remove from Watchlist
  const handleRemoveWatchlistItem = async (symbol: string) => {
    try {
      const res = await fetch(`/api/portfolio/${currentUser.id}/watchlist/${symbol}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const updated = await res.json();
        setWatchlist(updated);
        showToast(`Removed ${symbol} from Watchlist`);
        setScanResults((prev) =>
          prev.map((s) => (s.symbol === symbol ? { ...s, isWatchlist: false } : s))
        );
      }
    } catch (e) {
      console.error('Failed to remove watchlist item', e);
    }
  };

  // Add to Holdings
  const handleAddToHoldings = async (stock: StockScanResult, quantity: number, price: number) => {
    try {
      const res = await fetch(`/api/portfolio/${currentUser.id}/holdings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          quantity,
          avgPrice: price,
          currentPrice: stock.price,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setHoldings(updated);
        showToast(`Recorded ${quantity} shares of ${stock.symbol} in Holdings`);
        setScanResults((prev) =>
          prev.map((s) =>
            s.symbol === stock.symbol
              ? {
                  ...s,
                  isHolding: true,
                  holdingDetails: {
                    quantity,
                    avgPrice: price,
                    currentPrice: stock.price,
                    pnl: (stock.price - price) * quantity,
                    pnlPercent: price > 0 ? ((stock.price - price) / price) * 100 : 0,
                  },
                }
              : s
          )
        );
      }
    } catch (e) {
      console.error('Failed to add holding', e);
    }
  };

  // Add Manual Holding
  const handleAddManualHolding = async (hData: any) => {
    try {
      const res = await fetch(`/api/portfolio/${currentUser.id}/holdings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hData),
      });
      if (res.ok) {
        const updated = await res.json();
        setHoldings(updated);
        showToast(`Added ${hData.symbol} to Portfolio`);
      }
    } catch (e) {
      console.error('Failed to add manual holding', e);
    }
  };

  // Delete Holding
  const handleDeleteHolding = async (id: string) => {
    try {
      const res = await fetch(`/api/portfolio/${currentUser.id}/holdings/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const updated = await res.json();
        setHoldings(updated);
        showToast('Holding deleted');
      }
    } catch (e) {
      console.error('Failed to delete holding', e);
    }
  };

  // Alert Rules Actions
  const handleToggleAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/portfolio/${currentUser.id}/alerts/${id}/toggle`, {
        method: 'PATCH',
      });
      if (res.ok) {
        const updated = await res.json();
        setAlerts(updated);
      }
    } catch (e) {
      console.error('Failed to toggle alert', e);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/portfolio/${currentUser.id}/alerts/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const updated = await res.json();
        setAlerts(updated);
        showToast('Alert rule removed');
      }
    } catch (e) {
      console.error('Failed to delete alert', e);
    }
  };

  const handleAddAlert = async (rule: Omit<AlertRule, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch(`/api/portfolio/${currentUser.id}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      });
      if (res.ok) {
        const updated = await res.json();
        setAlerts(updated);
        showToast(`Created alert rule: ${rule.name}`);
      }
    } catch (e) {
      console.error('Failed to add alert rule', e);
    }
  };

  // Run Backtest
  const handleRunBacktest = async (minScore: number): Promise<BacktestSummary> => {
    const res = await fetch('/api/scanner/backtest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minScore, limit: 35 }),
    });
    if (!res.ok) throw new Error('Backtest failed');
    return await res.json();
  };

  const availableSectors = Array.from(new Set(scanResults.map((r) => r.sector))).filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-16 right-4 z-50 rounded-xl border border-indigo-500/40 bg-indigo-950/95 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      {/* Persistent Navigation Bar with Live Nifty Ticker */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        niftyQuote={nifty ? { price: nifty.niftyPrice, change: nifty.change, changePercent: nifty.changePercent } : null}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        holdingsCount={holdings.length}
        watchlistCount={watchlist.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'scanner' && (
          <ScannerView
            results={scanResults}
            summary={scanSummary}
            isLoading={isLoadingScan}
            onRefreshScan={runScanner}
            onSelectStock={handleSelectStock}
            onAddToWatchlist={handleAddToWatchlist}
            universe={universe}
            setUniverse={setUniverse}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            userHoldings={holdings}
            availableUniverses={AVAILABLE_UNIVERSES}
            availableSectors={availableSectors}
          />
        )}

        {activeTab === 'holdings' && (
          <HoldingsView
            holdings={holdings}
            onAddHolding={handleAddManualHolding}
            onDeleteHolding={handleDeleteHolding}
            onScanHoldings={() => {
              setUniverse('holdings');
              setActiveTab('scanner');
              runScanner('holdings', timeframe, true);
            }}
          />
        )}

        {activeTab === 'watchlist' && (
          <WatchlistView
            watchlist={watchlist}
            onRemoveItem={handleRemoveWatchlistItem}
            onAddItem={(item) => {
              fetch(`/api/portfolio/${currentUser.id}/watchlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item),
              })
                .then((r) => r.json())
                .then((updated) => {
                  setWatchlist(updated);
                  showToast(`Added ${item.symbol} to watchlist`);
                });
            }}
            onScanWatchlist={() => {
              setUniverse('watchlist');
              setActiveTab('scanner');
              runScanner('watchlist', timeframe, true);
            }}
            onSelectStock={(sym) => {
              const match = scanResults.find((s) => s.symbol === sym);
              if (match) {
                handleSelectStock(match);
              } else {
                // Fetch single stock scan
                fetch(`/api/scanner/chart/${sym}`)
                  .then((r) => r.json())
                  .then((data) => {
                    setSelectedStockCandles(data.candles || []);
                  });
              }
            }}
          />
        )}

        {activeTab === 'sectors' && (
          <SectorMomentumView
            sectors={sectors}
            nifty={nifty}
            onFilterBySector={(sectorName) => {
              setActiveTab('scanner');
              // Let user see filtered sector in scanner
              showToast(`Filtering scanner for ${sectorName} stocks`);
            }}
          />
        )}

        {activeTab === 'backtest' && (
          <BacktestView onRunBacktest={handleRunBacktest} />
        )}

        {activeTab === 'alerts' && (
          <AlertsView
            alerts={alerts}
            onToggleAlert={handleToggleAlert}
            onDeleteAlert={handleDeleteAlert}
            onAddAlert={handleAddAlert}
          />
        )}
      </main>

      {/* Stock In-Depth Analysis Modal */}
      {selectedStock && (
        <StockDetailModal
          stock={selectedStock}
          candles={selectedStockCandles}
          onClose={() => setSelectedStock(null)}
          onAddToWatchlist={handleAddToWatchlist}
          onAddToHoldings={handleAddToHoldings}
          onTimeframeChange={(tf) => {
            setTimeframe(tf);
            fetch(`/api/scanner/chart/${selectedStock.symbol}?timeframe=${tf}`)
              .then((r) => r.json())
              .then((data) => setSelectedStockCandles(data.candles || []));
          }}
        />
      )}

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <p>NSE Portfolio Tracker & AI Stock Scanner • Quantitative Rule-Based Engine</p>
          <p className="text-[11px] text-slate-600">
            Intended exclusively for technical research. Not registered SEBI investment advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
